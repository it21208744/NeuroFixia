from flask import Flask, request, jsonify
import os
import shutil
import numpy as np
import cv2
from tensorflow.keras.models import load_model
import mediapipe as mp
from tensorflow.keras.preprocessing import image
import joblib
import json

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

        if frame_count % frame_rate == 0:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)
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

# ✅ Updated function to predict behavior of a video using valid frames
def predict_behavior(video_path, model, label_map=None):
    output_folder = "valid_frames"

    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)
    os.makedirs(output_folder)

    extract_and_save_frames_with_keypoints(video_path, output_folder, frame_rate=5)

    keypoints = []
    for frame in sorted(os.listdir(output_folder)):
        frame_path = os.path.join(output_folder, frame)
        kp = extract_keypoints(frame_path)
        if kp:
            keypoints.append(np.array(kp).flatten())

    if len(keypoints) == 0:
        print("No valid frames with keypoints detected.")
        return None

    keypoints = np.array(keypoints)

    # ➕ Form sequences if needed by the model (LSTM style)
    sequence_length = 10
    if len(keypoints) < sequence_length:
        print("Not enough valid keypoints to form sequences.")
        return None

    sequences = []
    for i in range(len(keypoints) - sequence_length + 1):
        sequences.append(keypoints[i:i+sequence_length])
    sequences = np.array(sequences)

    predictions = model.predict(sequences)
    avg_probabilities = np.mean(predictions, axis=0)
    predicted_index = int(np.argmax(avg_probabilities))
    confidence = float(np.max(avg_probabilities))
    label = label_map[predicted_index] if label_map else f"Class {predicted_index}"

    return label, confidence, avg_probabilities

# Function to predict heatmap
def predict_heatmap(image_path):
    img = image.load_img(image_path, target_size=(128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    prediction = heatmap_model.predict(img_array)
    return prediction[0][0]

# Function to predict ASD based on facial expressions
def predict_asd(expressions):
    new_data_encoded = one_hot_encoder.transform([expressions])
    prediction = asd_model.predict(new_data_encoded)
    result = 'Non-ASD' if prediction[0][0] > 0.5 else 'ASD'
    return result, float(prediction[0][0])

import glob

@app.route('/predict-combined', methods=['POST'])
def predict_combined_endpoint():
    try:
        print("Request Form:", request.form)

        expressions = request.form.get('expressions')
        if expressions:
            try:
                expressions = json.loads(expressions)
                print("Parsed Expressions:", expressions)
            except json.JSONDecodeError as e:
                return jsonify({'error': 'Invalid expressions format. Expected a JSON array.'}), 400
        else:
            expressions = None

        # ✅ Find the latest video (.mp4) and image (.png) files
        video_files = glob.glob(os.path.join('testFiles/video', '*.webm'))
        image_files = glob.glob(os.path.join('testFiles/video', '*.png'))

        if not video_files:
            return jsonify({'error': 'No video file (.mp4) found in video folder.'}), 400
        if not image_files:
            return jsonify({'error': 'No image file (.png) found in video folder.'}), 400

        # ✅ Sort by modification time and pick the latest
        latest_video = max(video_files, key=os.path.getmtime)
        latest_image = max(image_files, key=os.path.getmtime)

        print("Latest video file:", latest_video)
        print("Latest image file:", latest_image)

        behavior_result, behavior_confidence, _ = None, None, None
        heatmap_result, heatmap_confidence = None, None
        asd_result, asd_confidence = None, None

        # ✅ Behavior prediction
        label_map = {0: "ASD", 1: "Non-ASD"}
        result = predict_behavior(latest_video, behavior_model, label_map)
        if result is not None:
            behavior_result, behavior_confidence, _ = result
            print("Behavior Result:", behavior_result)
        else:
            print("Behavior prediction failed.")

        # ✅ Heatmap prediction
        heatmap_confidence = predict_heatmap(latest_image)
        heatmap_result = "ASD" if heatmap_confidence <= 0.5 else "Non-ASD"
        print("Heatmap Result:", heatmap_result)

        # ✅ Expression-based ASD prediction
        if expressions:
            asd_result, asd_confidence = predict_asd(expressions)
            print("ASD Result:", asd_result)

        # ✅ Combine results
        weights = {'behavior': 0.4, 'heatmap': 0.4, 'asd': 0.2}
        prediction_map = {'autism': 1, 'TD': 0, 'ASD': 1, 'NON ASD': 0, 'Non-ASD': 0}

        weighted_sum = 0
        total_weight = 0

        if behavior_result:
            behavior_score = prediction_map.get(behavior_result, 0) * behavior_confidence
            weighted_sum += behavior_score * weights['behavior']
            total_weight += weights['behavior']

        if heatmap_result:
            score = 1 - heatmap_confidence if heatmap_result == 'ASD' else heatmap_confidence
            weighted_sum += prediction_map.get(heatmap_result, 0) * score * weights['heatmap']
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


if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(port=5002, debug=True)
