from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
from dotenv import load_dotenv
import joblib
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)

# Global variables for model and encoders
model = None
encoders_data = None

def load_model_and_encoders():
    """Load the trained model and feature encoders on startup"""
    global model, encoders_data
    
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'price_prediction_model.pkl')
        encoders_path = os.path.join(os.path.dirname(__file__), 'feature_encoders.pkl')
        
        if not os.path.exists(model_path):
            print(f"WARNING: Model file not found at {model_path}")
            print("Please run 'python train_model.py' first to train the model.")
            return False
        
        if not os.path.exists(encoders_path):
            print(f"WARNING: Encoders file not found at {encoders_path}")
            return False
        
        model = joblib.load(model_path)
        encoders_data = joblib.load(encoders_path)
        
        print("[OK] Model loaded successfully")
        print(f"  Model type: {encoders_data.get('model_name', 'Unknown')}")
        print(f"  Features: {', '.join(encoders_data['feature_columns'])}")
        
        return True
    except Exception as e:
        print(f"ERROR loading model: {str(e)}")
        traceback.print_exc()
        return False

# Load model on startup
model_loaded = load_model_and_encoders()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model_loaded else 'degraded',
        'service': 'ml-service',
        'model_loaded': model_loaded
    })

@app.route('/predict', methods=['POST'])
def predict_price():
    """
    Predict crop price based on input features
    
    Expected input:
    {
        "crop": "Wheat",
        "location": "North",
        "season": "Rabi",
        "soil_type": "Loamy",
        "farmer_type": "Small",  // optional, defaults to "Medium"
        "rainfall": 800,          // optional, defaults to 1000
        "temperature": 25,        // optional, defaults to 25
        "area": 5.0,             // optional, defaults to 5.0
        "yield": 4.0             // optional, defaults to 4.0
    }
    """
    try:
        if not model_loaded:
            return jsonify({
                'error': 'Model not loaded. Please train the model first by running train_model.py'
            }), 503
        
        data = request.json
        
        # Extract and validate required fields
        crop = data.get('crop')
        location = data.get('location')
        
        if not crop or not location:
            return jsonify({
                'error': 'Missing required fields: crop and location are required'
            }), 400
        
        # Extract optional fields with defaults
        season = data.get('season', 'Kharif')
        soil_type = data.get('soil_type', 'Loamy')
        farmer_type = data.get('farmer_type', 'Medium')
        rainfall = float(data.get('rainfall', 1000))
        temperature = float(data.get('temperature', 25))
        area = float(data.get('area', 5.0))
        yield_value = float(data.get('yield', 4.0))
        
        # Prepare features in the correct order
        feature_columns = encoders_data['feature_columns']
        encoders = encoders_data['encoders']
        
        # Create feature dictionary
        features_dict = {
            'Crop_Type': crop,
            'Region': location,
            'Season': season,
            'Soil_Type': soil_type,
            'Farmer_Type': farmer_type,
            'Rainfall_mm': rainfall,
            'Temperature_C': temperature,
            'Area_Hectare': area,
            'Yield_ton_per_hectare': yield_value
        }
        
        # Encode categorical features
        encoded_features = []
        for feature in feature_columns:
            if feature in encoders:
                # Categorical feature - encode it
                encoder = encoders[feature]
                value = features_dict[feature]
                
                # Check if value is in encoder classes
                if value not in encoder.classes_:
                    # Use the most common class as fallback
                    value = encoder.classes_[0]
                    print(f"Warning: Unknown {feature} '{features_dict[feature]}', using '{value}'")
                
                encoded_value = encoder.transform([value])[0]
                encoded_features.append(encoded_value)
            else:
                # Numeric feature - use as is
                encoded_features.append(features_dict[feature])
        
        # Make prediction
        features_array = np.array([encoded_features])
        predicted_price = model.predict(features_array)[0]
        
        # Calculate confidence (simplified - based on feature values)
        # In a real scenario, you'd use prediction intervals or ensemble variance
        confidence = 0.85  # Default confidence
        
        # Adjust confidence based on whether we had to use fallback values
        if any(features_dict[f] not in encoders[f].classes_ for f in encoders.keys()):
            confidence = 0.70
        
        return jsonify({
            'crop': crop,
            'location': location,
            'predicted_price': round(float(predicted_price), 2),
            'confidence': round(confidence, 2),
            'unit': 'INR per ton',
            'features_used': {
                'season': season,
                'soil_type': soil_type,
                'farmer_type': farmer_type,
                'rainfall_mm': rainfall,
                'temperature_c': temperature,
                'area_hectare': area,
                'yield_ton_per_hectare': yield_value
            }
        })
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 503
    
    return jsonify({
        'model_name': encoders_data.get('model_name', 'Unknown'),
        'features': encoders_data['feature_columns'],
        'categorical_features': list(encoders_data['encoders'].keys()),
        'feature_details': {
            feature: {
                'type': 'categorical' if feature in encoders_data['encoders'] else 'numeric',
                'classes': list(encoders_data['encoders'][feature].classes_) if feature in encoders_data['encoders'] else None
            }
            for feature in encoders_data['feature_columns']
        }
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f"\nStarting ML Service on port {port}...")
    print(f"Model loaded: {model_loaded}")
    if not model_loaded:
        print("\n[WARNING]  WARNING: Model not loaded!")
        print("   Run 'python train_model.py' to train the model first.\n")
    app.run(host='0.0.0.0', port=port, debug=True)
