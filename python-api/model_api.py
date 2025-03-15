from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from tensorflow import keras
from tensorflow.keras import layers

app = Flask(__name__)

# Load the dataset and train the model once when the server starts
file_path = 'asd_facial_expression_dataset (1).csv'
asd_data = pd.read_csv(file_path)

# Encode labels
label_encoder = LabelEncoder()
asd_data['ASD Status'] = label_encoder.fit_transform(asd_data['ASD Status'])

# One-hot encode facial expressions
expression_cols = ['Q1 Answer', 'Q2 Answer', 'Q3 Answer', 'Q4 Answer']
one_hot_encoder = OneHotEncoder()
encoded_expressions = one_hot_encoder.fit_transform(asd_data[expression_cols]).toarray()

# Prepare features and labels
X = encoded_expressions
y = asd_data['ASD Status'].values

# Train-test split
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build CNN model
model = keras.Sequential([
    layers.Conv1D(32, kernel_size=3, activation='relu', input_shape=(X_train.shape[1], 1)),
    layers.MaxPooling1D(pool_size=2),
    layers.Conv1D(64, kernel_size=3, activation='relu'),
    layers.MaxPooling1D(pool_size=2),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

# Compile and train the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.fit(X_train, y_train, epochs=20, validation_data=(X_test, y_test))

# Evaluate once
test_loss, test_accuracy = model.evaluate(X_test, y_test)
print(f'Test Accuracy: {test_accuracy:.2f}')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        input_data = request.json['expressions']
        input_array = np.array(input_data).reshape(1, -1, 1)

        # Make prediction
        prediction = model.predict(input_array)[0][0]
        result = 'Autism' if prediction > 0.5 else 'Non-Autism'

        return jsonify({'prediction': result, 'confidence': float(prediction)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
