from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import joblib
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# ── Load model artifacts at startup ──────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

_model = None
_label_encoders = None
_target_encoder = None
_feature_names = None

_crop_model = None
_crop_label_encoder = None


def load_artifacts():
    global _model, _label_encoders, _target_encoder, _feature_names
    global _crop_model, _crop_label_encoder

    # Fertilizer model artifacts
    model_path   = os.path.join(MODELS_DIR, 'fertilizer_model.pkl')
    enc_path     = os.path.join(MODELS_DIR, 'label_encoders.pkl')
    target_path  = os.path.join(MODELS_DIR, 'target_encoder.pkl')
    feature_path = os.path.join(MODELS_DIR, 'feature_names.pkl')

    if all(os.path.exists(p) for p in [model_path, enc_path, target_path, feature_path]):
        _model          = joblib.load(model_path)
        _label_encoders = joblib.load(enc_path)
        _target_encoder = joblib.load(target_path)
        _feature_names  = joblib.load(feature_path)
        print("[ML] Fertilizer model loaded successfully.")
    else:
        print("[ML] WARNING: Fertilizer model files not found. Run train_model.py first.")

    # Crop model artifacts
    crop_model_path = os.path.join(MODELS_DIR, 'crop_model.pkl')
    crop_enc_path   = os.path.join(MODELS_DIR, 'crop_label_encoder.pkl')

    if os.path.exists(crop_model_path) and os.path.exists(crop_enc_path):
        _crop_model = joblib.load(crop_model_path)
        _crop_label_encoder = joblib.load(crop_enc_path)
        print("[ML] Crop Recommendation model loaded successfully.")
    else:
        print("[ML] WARNING: Crop model files not found. Run train_crop_model.py first.")

    return _model is not None or _crop_model is not None


load_artifacts()


# ── Helpers ──────────────────────────────────────────────────────────────────
def encode_input(data: dict) -> np.ndarray:
    """Encode raw input dict → numpy array matching training feature order."""
    soil_type = data.get('soilType', 'Sandy')
    crop_type = data.get('cropType', 'Maize')

    soil_le = _label_encoders['Soil Type']
    crop_le = _label_encoders['Crop Type']

    # Handle unseen labels gracefully
    if soil_type not in soil_le.classes_:
        soil_type = soil_le.classes_[0]
    if crop_type not in crop_le.classes_:
        crop_type = crop_le.classes_[0]

    soil_enc = int(soil_le.transform([soil_type])[0])
    crop_enc = int(crop_le.transform([crop_type])[0])

    row = [
        float(data.get('temperature', 28)),
        float(data.get('humidity', 55)),
        float(data.get('moisture', 45)),
        float(data.get('nitrogen', 20)),
        float(data.get('potassium', 10)),
        float(data.get('phosphorous', 15)),
        soil_enc,
        crop_enc,
    ]
    return np.array([row])


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health_check():
    model_ready = _model is not None
    return jsonify({
        'status': 'healthy',
        'service': 'ml-service',
        'model_loaded': model_ready,
        'model': 'XGBoost Fertilizer Recommender'
    })


@app.route('/recommend-fertilizer', methods=['POST'])
def recommend_fertilizer():
    """
    POST /recommend-fertilizer
    Body:
    {
        "temperature": 30,
        "humidity": 60,
        "moisture": 50,
        "nitrogen": 37,
        "potassium": 0,
        "phosphorous": 0,
        "soilType": "Sandy",
        "cropType": "Maize"
    }

    Returns top-3 fertilizer recommendations with confidence scores.
    """
    try:
        if _model is None:
            return jsonify({
                'error': 'Model not loaded. Please run train_model.py first.'
            }), 503

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON body provided'}), 400

        X = encode_input(data)
        proba = _model.predict_proba(X)[0]
        top3_idx = np.argsort(proba)[::-1][:3]

        recommendations = []
        for rank, idx in enumerate(top3_idx):
            fertilizer_name = _target_encoder.inverse_transform([idx])[0]
            recommendations.append({
                'rank': rank + 1,
                'fertilizer': fertilizer_name,
                'confidence': round(float(proba[idx]) * 100, 1),
            })

        return jsonify({
            'success': True,
            'input': {
                'soilType': data.get('soilType'),
                'cropType': data.get('cropType'),
                'nitrogen': data.get('nitrogen'),
                'phosphorous': data.get('phosphorous'),
                'potassium': data.get('potassium'),
            },
            'recommendations': recommendations,
            'available_soil_types': list(_label_encoders['Soil Type'].classes_),
            'available_crop_types': list(_label_encoders['Crop Type'].classes_),
        })

    except Exception as e:
        print(f"[ML] Error in recommend_fertilizer: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/recommend-crop', methods=['POST'])
def recommend_crop():
    """
    POST /recommend-crop
    Body:
    {
        "temperature": 25.5,
        "humidity": 70,
        "rainfall": 150,
        "ph": 6.5,
        "nitrogen": 80,
        "phosphorous": 40,
        "potassium": 40
    }
    """
    try:
        if _crop_model is None:
            return jsonify({
                'error': 'Crop model not loaded. Please run train_crop_model.py first.'
            }), 503

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON body provided'}), 400

        # Features order: N, P, K, temperature, humidity, ph, rainfall
        row = [
            float(data.get('nitrogen', 50)),
            float(data.get('phosphorous', 50)),
            float(data.get('potassium', 50)),
            float(data.get('temperature', 25)),
            float(data.get('humidity', 60)),
            float(data.get('ph', 6.5)),
            float(data.get('rainfall', 100))
        ]
        
        X = np.array([row])
        proba = _crop_model.predict_proba(X)[0]
        top3_idx = np.argsort(proba)[::-1][:3]

        recommendations = []
        for rank, idx in enumerate(top3_idx):
            crop_name = _crop_label_encoder.inverse_transform([idx])[0]
            recommendations.append({
                'rank': rank + 1,
                'crop': str(crop_name).capitalize(),
                'confidence': round(float(proba[idx]) * 100, 1),
            })

        return jsonify({
            'success': True,
            'input': {
                'nitrogen': row[0],
                'phosphorous': row[1],
                'potassium': row[2],
                'temperature': row[3],
                'humidity': row[4],
                'ph': row[5],
                'rainfall': row[6]
            },
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"[ML] Error in recommend_crop: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/predict', methods=['POST'])
def predict_price():
    """Legacy price prediction endpoint (mock)."""
    try:
        data = request.get_json()
        crop = data.get('crop')
        base_price = 50.0
        prediction = base_price + np.random.normal(0, 5)
        return jsonify({
            'crop': crop,
            'predicted_price': round(prediction, 2),
            'confidence': 0.85
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
