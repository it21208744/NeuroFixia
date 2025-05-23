from flask import Flask, request, jsonify
import numpy as np
import cv2
import mediapipe as mp
import tensorflow as tf
import os
from fer import FER
from flask_cors import CORS



app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = tf.keras.models.load_model("cnn_lstm_model.h5")

mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
mp_hands_instance = mp_hands.Hands()
mp_pose_instance = mp_pose.Pose()
emotion_detector = FER()

SEQUENCE_LENGTH = 30
NUM_FEATURES = 3

def calculate_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def calculate_angle(p1, p2, p3):
    a = np.array(p1)
    b = np.array(p2)
    c = np.array(p3)
    angle = np.degrees(np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0]))
    return abs(angle)

def extract_features_from_frame(frame):
    try:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        hand_results = mp_hands_instance.process(frame_rgb)
        pose_results = mp_pose_instance.process(frame_rgb)

        if not pose_results.pose_landmarks:
            return [0, 0, 0]

        pose_landmarks = pose_results.pose_landmarks.landmark
        left_ear = (pose_landmarks[mp_pose.PoseLandmark.LEFT_EAR].x, pose_landmarks[mp_pose.PoseLandmark.LEFT_EAR].y)
        right_ear = (pose_landmarks[mp_pose.PoseLandmark.RIGHT_EAR].x, pose_landmarks[mp_pose.PoseLandmark.RIGHT_EAR].y)

        left_hand = right_hand = (0, 0)
        if hand_results.multi_hand_landmarks:
            hand_landmarks = hand_results.multi_hand_landmarks[0].landmark
            left_hand = (hand_landmarks[mp_hands.HandLandmark.WRIST].x, hand_landmarks[mp_hands.HandLandmark.WRIST].y)
            right_hand = (hand_landmarks[mp_hands.HandLandmark.WRIST].x, hand_landmarks[mp_hands.HandLandmark.WRIST].y)

        left_distance = calculate_distance(left_hand, left_ear)
        right_distance = calculate_distance(right_hand, right_ear)

        left_shoulder = (pose_landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, pose_landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y)
        left_elbow = (pose_landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, pose_landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y)

        left_arm_angle = calculate_angle(left_shoulder, left_elbow, left_hand)

        return [left_distance, right_distance, left_arm_angle]

    except Exception as e:
        print(f"⚠ Skipping frame due to error: {e}")
        return [0, 0, 0]

def extract_features_from_video(video_path, sequence_length=SEQUENCE_LENGTH):
    cap = cv2.VideoCapture(video_path)
    features = []
    frame_list = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        feature = extract_features_from_frame(frame)
        if feature is not None:
            features.append(feature)
            frame_list.append(frame)
    cap.release()

    if len(features) < sequence_length:
        padding = np.zeros((sequence_length - len(features), NUM_FEATURES))
        features = np.vstack((features, padding))
    elif len(features) > sequence_length:
        features = features[:sequence_length]
        frame_list = frame_list[:sequence_length]

    features = np.array(features).reshape(1, sequence_length, NUM_FEATURES)

    # Middle frame for emotion
    middle_frame = frame_list[len(frame_list) // 2] if frame_list else None

    return features, middle_frame

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    video_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(video_path)

    features, mid_frame = extract_features_from_video(video_path)

    if features is None or features.shape != (1, SEQUENCE_LENGTH, NUM_FEATURES):
        return jsonify({"error": "Failed to extract valid features from the video"}), 400

    # CNN-LSTM prediction
    prediction = model.predict(features)
    model_predicted_label = "Hypersensitivity" if prediction[0][0] > 0.5 else "Not Hypersensitivity"
    confidence_hyper = float(prediction[0][0])
    confidence_not_hyper = 1 - confidence_hyper

    # FER emotion detection
    dominant_emotion = "Unknown"
    emotion_alignment = False
    if mid_frame is not None:
        emotions = emotion_detector.detect_emotions(mid_frame)
        if emotions:
            top_emotions = emotions[0]['emotions']
            dominant_emotion = max(top_emotions, key=top_emotions.get)
            if dominant_emotion in ["fear", "angry", "sad"]:
                emotion_alignment = True
            elif dominant_emotion == "neutral" and model_predicted_label == "Hypersensitivity":
                emotion_alignment = True
            else:
                emotion_alignment = False

    # Final decision: BOTH model and emotion must suggest hypersensitivity
    if model_predicted_label == "Hypersensitivity" and emotion_alignment:
        final_label = "Hypersensitivity"
    else:
        final_label = "Not Hypersensitivity"
    
    

    return jsonify({
        "final_prediction": final_label,
        "cnn_lstm_prediction": model_predicted_label,
        "confidence_hypersensitivity": confidence_hyper,
        "confidence_not_hypersensitivity": confidence_not_hyper,
        "dominant_emotion": dominant_emotion,
        "emotion_alignment_with_hypersensitivity": emotion_alignment
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
