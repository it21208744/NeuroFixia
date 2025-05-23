from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load the trained model
model_path = "knn_model2.pkl"
try:
    with open(model_path, "rb") as f:
        model = pickle.load(f)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route("/")
def home():
    return "Autism Prediction API is Running!"

# API route to get predictions
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        features = data.get("features", [])

        # Convert all input values to numeric (float)
        features = np.array(features, dtype=float).reshape(1, -1)  

        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        prediction = model.predict(features)
        probabilities = model.predict_proba(features)  # Get probability scores

        probability_autism = float(probabilities[0][1])  # Probability of Cognitive Disabilities (Class 1)
        probability_td = float(probabilities[0][0])  # Probability of Strong Cognitive Abilities (Class 0)
        confidence_score = round(max(probability_autism, probability_td) * 100, 2)  # Convert to %

        result = {
            "prediction": int(prediction[0]),
            "probability_autism": round(probability_autism * 100, 2),
            "probability_td": round(probability_td * 100, 2),
            "confidence_score": confidence_score
        }

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
