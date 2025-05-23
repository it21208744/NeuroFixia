from flask import Flask, request, jsonify
import os
import shutil
import numpy as np
import cv2
from tensorflow.keras.models import load_model
import mediapipe as mp
from tensorflow.keras.preprocessing import image
import pandas as pd
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
import joblib
import json  # Add this import


app = Flask(__name__)

# Load the trained models
behavior_model = load_model('./autism_behavior_model_v3.h5')
heatmap_model = load_model('./heatMap_prediction.h5')
asd_model = load_model('asd_prediction_model.h5')

# Load the saved encoders
label_encoder = joblib.load('label_encoder.joblib')
one_hot_encoder = joblib.load('one_hot_encoder.joblib')

# Setup Mediapipe Pose model
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# Function to extract and save frames with valid keypoints
def extract_and_save_frames_with_keypoints(video_path, output_folder, frame_rate=5):
    os.makedirs(output_folder, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    valid_frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Save every `frame_rate` frame for processing
        if frame_count % frame_rate == 0:
            # Convert frame to RGB for Mediapipe
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)
            
            # Save the frame only if pose landmarks are detected
            if results.pose_landmarks:
                frame_name = f"{os.path.splitext(os.path.basename(video_path))[0]}_valid_frame_{valid_frame_count}.jpg"
                cv2.imwrite(os.path.join(output_folder, frame_name), frame)
                valid_frame_count += 1

        frame_count += 1
    
    cap.release()

# Function to extract keypoints from an image
def extract_keypoints(image_path):
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = pose.process(image_rgb)
    keypoints = []
    if results.pose_landmarks:
        for landmark in results.pose_landmarks.landmark:
            keypoints.append((landmark.x, landmark.y, landmark.z))
    return keypoints

# Function to predict behavior of a video using valid frames
def predict_behavior(video_path, model):
    output_folder = "valid_frames"

    # Clear the output folder if it exists
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)  # Delete the folder and its contents
    os.makedirs(output_folder)  # Recreate the empty folder

    # Extract and save valid frames with keypoints
    extract_and_save_frames_with_keypoints(video_path, output_folder, frame_rate=5)

    # Process each valid frame to extract keypoints
    keypoints = []
    for frame in sorted(os.listdir(output_folder)):
        frame_path = os.path.join(output_folder, frame)
        kp = extract_keypoints(frame_path)
        if kp:
            keypoints.append(np.array(kp).flatten())

    # Check if we have any valid frames with keypoints
    if len(keypoints) == 0:
        print("No valid frames with keypoints detected.")
        return None  # Return None if no keypoints were detected in any frame

    # Convert keypoints into a numpy array
    keypoints = np.array(keypoints)

    # Predict probabilities for each frame
    predictions = model.predict(keypoints)

    # Return the mean probability distribution across all frames (for each class)
    avg_probabilities = np.mean(predictions, axis=0)

    # Return the predicted probabilities for each class
    return avg_probabilities

# Function to predict heatmap
def predict_heatmap(image_path):
    img = image.load_img(image_path, target_size=(128, 128))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    prediction = heatmap_model.predict(img_array)
    return prediction[0][0]

# Function to predict ASD based on facial expressions
def predict_asd(expressions):
    # Encode the input data
    new_data_encoded = one_hot_encoder.transform([expressions])
    prediction = asd_model.predict(new_data_encoded)
    result = 'Non-ASD' if prediction[0][0] > 0.5 else 'ASD'
    return result, float(prediction[0][0])


@app.route('/predict-combined', methods=['POST'])
def predict_combined_endpoint():
    try:
        print("Request Form:", request.form)

        # Parse expressions
        expressions = request.form.get('expressions')
        if expressions:
            try:
                expressions = json.loads(expressions)
                print("Parsed Expressions:", expressions)
            except json.JSONDecodeError as e:
                print("Error parsing expressions:", e)
                return jsonify({'error': 'Invalid expressions format. Expected a JSON array.'}), 400
        else:
            expressions = None

        # Load video and image from predefined folders
        video_folder = 'testFiles/video'
        image_folder = 'testFiles/heatMap'

        # Get the first file from each folder
        # Use the specific video file named 'video.webm'
        video_path = os.path.join(video_folder, 'video.webm')
        if not os.path.isfile(video_path):
            return jsonify({'error': 'video.webm not found in the video folder.'}), 400

        image_path = next((os.path.join(image_folder, f) for f in os.listdir(image_folder) if f.endswith(('.png', '.jpg', '.jpeg'))), None)

        print("Using Video Path:", video_path)
        print("Using Image Path:", image_path)

        # Initialize results
        behavior_result = None
        behavior_confidence = None
        heatmap_result = None
        heatmap_confidence = None
        asd_result = None
        asd_confidence = None

        # Get predictions from each model
        if video_path:
            behavior_probabilities = predict_behavior(video_path, behavior_model)
            if behavior_probabilities is not None:
                behavior_result = 'ASD' if np.argmax(behavior_probabilities) == 0 else 'Non-ASD'
                behavior_confidence = float(behavior_probabilities[np.argmax(behavior_probabilities)])
                print("Behavior Result:", behavior_result)
                print("Behavior Confidence:", behavior_confidence)

        if image_path:
            heatmap_confidence = predict_heatmap(image_path)
            heatmap_result = "ASD" if heatmap_confidence <= 0.5 else "Non-ASD"
            print("Heatmap Confidence:", heatmap_confidence)
            print("Heatmap Result:", heatmap_result)

        if expressions:
            asd_result, asd_confidence = predict_asd(expressions)
            print("ASD Result:", asd_result)
            print("ASD Confidence:", asd_confidence)

        # Combine results using weighted average
        weights = {
            'behavior': 0.4,
            'heatmap': 0.4,
            'asd': 0.2
        }

        prediction_map = {
            'autism': 1,
            'TD': 0,
            'ASD': 1,
            'NON ASD': 0,
            'Non-ASD': 0
        }

        weighted_sum = 0
        total_weight = 0

        if behavior_result:
            behavior_score = prediction_map.get(behavior_result, 0) * behavior_confidence
            weighted_sum += behavior_score * weights['behavior']
            total_weight += weights['behavior']

        if heatmap_result:
            heatmap_score = prediction_map.get(heatmap_result, 0) * (1 - heatmap_confidence if heatmap_result == 'ASD' else heatmap_confidence)
            weighted_sum += heatmap_score * weights['heatmap']
            total_weight += weights['heatmap']

        if asd_result:
            asd_score = prediction_map.get(asd_result, 0) * asd_confidence
            weighted_sum += asd_score * weights['asd']
            total_weight += weights['asd']

        if total_weight == 0:
            return jsonify({'error': 'No valid predictions available.'}), 400

        combined_prediction = weighted_sum / total_weight
        final_result = 'autism' if combined_prediction > 0.5 else 'non-autism'

        return jsonify({
            'final_prediction': final_result,
            'combined_confidence': float(combined_prediction),
            'details': {
                'behavior': {
                    'prediction': behavior_result,
                    'confidence': behavior_confidence
                },
                'heatmap': {
                    'prediction': heatmap_result,
                    'confidence': float(heatmap_confidence)
                },
                'facial_expressions_recognition': {
                    'prediction': asd_result,
                    'confidence': asd_confidence
                }
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# @app.route('/test-combined', methods=['GET'])
# def test_combined_endpoint():
#     try:
#         # Hardcoded test data
#         video_path = './test_video.mp4'  # Replace with the path to a test video
#         image_path = './test_image.png'  # Replace with the path to a test image
#         expressions = ['Happy', 'Sad', 'Angry', 'No answer']

#         # Simulate a request to /predict-combined
#         response = predict_combined_endpoint({
#             'video_path': video_path,
#             'image_path': image_path,
#             'expressions': expressions
#         })

#         return response
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create the uploads directory if it doesn't exist
    os.makedirs('uploads', exist_ok=True)
    app.run(port=5002, debug=True)