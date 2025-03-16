from flask import Flask, request, jsonify
import os
import shutil
import numpy as np
import cv2
from tensorflow.keras.models import load_model
import mediapipe as mp

app = Flask(__name__)

# Load the trained model
model = load_model('./autism_behavior_model_v3.h5')

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

@app.route('/predict-behavior', methods=['POST'])
def predict_behavior_endpoint():
    try:
        video_path = request.json['video_path']
        avg_probabilities = predict_behavior(video_path, model)

        if avg_probabilities is not None:
            predicted_class = np.argmax(avg_probabilities)
            result = 'autism' if predicted_class == 0 else 'TD'
            return jsonify({'prediction': result, 'probabilities': avg_probabilities.tolist()})
        else:
            return jsonify({'error': 'No valid frames with keypoints detected.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)