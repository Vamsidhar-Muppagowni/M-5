import pandas as pd
import numpy as np
import random
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
import joblib
import os

# 1. Generate Synthetic Training Data
def generate_data(num_samples=5000):
    crops = ['Rice', 'Wheat', 'Corn', 'Potato', 'Onion', 'Tomato', 'Cotton', 'Sugarcane']
    varieties = {
        'Rice': ['Basmati', 'Sona Masuri', 'Jasmine', 'Brown'],
        'Wheat': ['Durum', 'Emmer', 'Spelt'],
        'Corn': ['Sweet', 'Field', 'Popcorn'],
        'Potato': ['Russet', 'Yukon Gold', 'Red'],
        'Onion': ['Red', 'White', 'Yellow'],
        'Tomato': ['Roma', 'Cherry', 'Beefsteak'],
        'Cotton': ['Pima', 'Upland'],
        'Sugarcane': ['Cane']
    }
    locations = ['North', 'South', 'East', 'West', 'Central']
    qualities = ['A', 'B', 'C', 'D']
    seasons = ['Summer', 'Winter', 'Monsoon', 'Autumn']
    
    data = []
    
    base_prices = {
        'Rice': 40, 'Wheat': 25, 'Corn': 20, 'Potato': 15, 
        'Onion': 30, 'Tomato': 20, 'Cotton': 60, 'Sugarcane': 5
    }
    
    for _ in range(num_samples):
        crop = random.choice(crops)
        variety = random.choice(varieties.get(crop, ['Standard']))
        location = random.choice(locations)
        quality = random.choice(qualities)
        season = random.choice(seasons)
        quantity = random.randint(10, 5000)
        
        # Logic for price generation (simulating real market factors)
        price = base_prices[crop]
        
        # Quality factor
        if quality == 'A': price *= 1.2
        elif quality == 'B': price *= 1.0
        elif quality == 'C': price *= 0.8
        elif quality == 'D': price *= 0.6
        
        # Season factor
        if season == 'Summer': price *= 1.05
        elif season == 'Monsoon': price *= 1.15
        elif season == 'Winter': price *= 1.10
        
        # Location factor
        if location == 'North': price *= 1.05
        elif location == 'South': price *= 0.95
        
        # Quantity discount simulation
        if quantity > 1000: price *= 0.98
        
        # Random noise
        price *= random.uniform(0.9, 1.1)
        
        data.append({
            'Crop': crop,
            'Variety': variety,
            'Location': location,
            'Quality': quality,
            'Season': season,
            'Quantity': quantity,
            'Price': round(price, 2)
        })
        
    return pd.DataFrame(data)

def train_model():
    print("Generating synthetic data...")
    df = generate_data()
    
    X = df.drop('Price', axis=1)
    y = df['Price']
    
    # 2. Define Preprocessing
    categorical_features = ['Crop', 'Variety', 'Location', 'Quality', 'Season']
    numerical_features = ['Quantity']
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    numerical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    # 3. Create Pipeline with Model
    # Random Forest is robust and handles non-linearities well for pricing
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    # 4. Train
    print("Training model...")
    model.fit(X, y)
    
    # 5. Save
    model_path = os.path.join(os.path.dirname(__file__), 'price_model.pkl')
    print(f"Saving model to {model_path}...")
    joblib.dump(model, model_path)
    print("Done!")

if __name__ == "__main__":
    train_model()
