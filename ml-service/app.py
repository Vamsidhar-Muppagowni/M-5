from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ml-service'})

@app.route('/predict', methods=['POST'])
def predict_price():
    try:
        data = request.json
        # Extract features: crop, location, date, etc.
        # This is a mock implementation until model is trained
        
        crop = data.get('crop')
        location = data.get('location')
        
        # Mock logic
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
