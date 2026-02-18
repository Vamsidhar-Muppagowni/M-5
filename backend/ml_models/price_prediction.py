import sys
import json
import random
import datetime
import os

# Try to import ML libraries
try:
    import joblib
    import pandas as pd
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

# Hardcoded base prices for fallback
CROP_BASE_PRICES = {
    'wheat': 25.0,
    'rice': 35.0,
    'corn': 20.0,
    'potato': 15.0,
    'onion': 30.0,
    'tomato': 20.0,
    'cotton': 60.0,
    'sugarcane': 4.0
}

MODEL_WEIGHTS = {
    'intercept': 50.0,
    'coefficients': {
        'quality_A': 1.2,
        'quality_B': 1.0,
        'quality_C': 0.8,
        'quality_D': 0.6,
        'season_summer': 1.1,
        'season_winter': 1.05,
        'season_monsoon': 0.95,
        'season_autumn': 1.0,
        'location_factor': {
            'default': 1.0,
            'north': 1.1,
            'south': 1.05,
            'east': 0.9,
            'west': 1.15
        }
    }
}

def get_season():
    month = datetime.datetime.now().month
    if 3 <= month <= 5: return 'Summer'
    if 6 <= month <= 9: return 'Monsoon'
    if 10 <= month <= 11: return 'Autumn'
    return 'Winter'

def predict_price_heuristic(crop_name, variety, location, quality, quantity):
    try:
        # Normalize inputs for heuristic
        crop_lower = crop_name.lower().strip()
        quality_upper = quality.upper().strip()
        location_lower = location.lower().strip()
        
        # 1. Base Price
        base_price = CROP_BASE_PRICES.get(crop_lower, 40.0)
        
        # 2. Apply Coefficients
        coeffs = MODEL_WEIGHTS['coefficients']
        quality_mult = coeffs.get(f'quality_{quality_upper}', 1.0)
        
        season_lower = get_season().lower() # Heuristic uses lowercase seasons in keys? 
        # Check keys: 'season_summer', etc. Yes.
        season_mult = coeffs.get(f'season_{season_lower}', 1.0)
        
        loc_mult = 1.0
        if 'north' in location_lower: loc_mult = coeffs['location_factor']['north']
        elif 'south' in location_lower: loc_mult = coeffs['location_factor']['south']
        elif 'east' in location_lower: loc_mult = coeffs['location_factor']['east']
        elif 'west' in location_lower: loc_mult = coeffs['location_factor']['west']
        
        # 3. Calculate
        predicted_unit_price = base_price * quality_mult * season_mult * loc_mult
        
        # 4. Variance
        random.seed(crop_name + location + str(datetime.date.today()))
        variance = random.uniform(0.95, 1.05)
        
        final_price = predicted_unit_price * variance
        
        if quantity > 1000:
            final_price *= 0.98
            
        return round(final_price, 2)
        
    except Exception as e:
        return 50.0 # Ultimate fallback

def predict_price_ml(model, crop, variety, location, quality, quantity):
    try:
        # Prepare DataFrame for model
        input_data = {
            'Crop': [crop],
            'Variety': [variety],
            'Location': [location],
            'Quality': [quality],
            'Season': [get_season()],
            'Quantity': [quantity]
        }
        
        df = pd.DataFrame(input_data)
        
        # Predict
        prediction = model.predict(df)[0]
        return round(float(prediction), 2)
        
    except Exception as e:
        # console.log equivalent for debugging via stderr if needed
        # sys.stderr.write(f"ML Prediction Error: {str(e)}\n")
        raise e

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            raise ValueError("No input data provided")
            
        params = json.loads(input_data)
        
        crop = params.get('crop', 'Rice')
        variety = params.get('variety', 'Standard')
        location = params.get('location', 'North')
        quality = params.get('quality', 'B')
        quantity = float(params.get('quantity', 100))
        
        predicted_price = None
        method = 'heuristic'
        
        # Try ML Prediction
        if ML_AVAILABLE:
            model_path = os.path.join(os.path.dirname(__file__), 'price_model.pkl')
            if os.path.exists(model_path):
                try:
                    model = joblib.load(model_path)
                    predicted_price = predict_price_ml(model, crop, variety, location, quality, quantity)
                    method = 'ml_random_forest'
                except Exception as e:
                    # ML failed, fall back
                    # sys.stderr.write(f"Model load/predict failed: {str(e)}\n")
                    pass
        
        # Fallback to Heuristic
        if predicted_price is None:
            predicted_price = predict_price_heuristic(crop, variety, location, quality, quantity)
            method = 'heuristic_fallback'
            
        result = {
            'predicted_price': predicted_price,
            'currency': 'INR',
            'confidence_score': 0.92 if method == 'ml_random_forest' else 0.75,
            'model_version': method
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_response = {
            'error': str(e),
            'predicted_price': None
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    main()
