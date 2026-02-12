import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import xgboost as xgb
import joblib
import os

def train_model():
    print("=" * 60)
    print("ML Model Training Pipeline")
    print("=" * 60)
    
    # Load dataset
    print("\n[1/7] Loading dataset...")
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'farm_profit_dashboard_dataset.csv')
    df = pd.read_csv(data_path)
    print(f"[OK] Loaded {len(df)} records with {len(df.columns)} columns")
    print(f"  Columns: {', '.join(df.columns[:5])}...")
    
    # Preprocessing
    print("\n[2/7] Preprocessing data...")
    
    # Select relevant features for price prediction
    # Target: Market_Price_per_ton_INR
    # Features: Crop_Type, Region, Season, Soil_Type, Farmer_Type, Rainfall_mm, Temperature_C, 
    #           Area_Hectare, Yield_ton_per_hectare
    
    feature_columns = [
        'Crop_Type', 'Region', 'Season', 'Soil_Type', 'Farmer_Type',
        'Rainfall_mm', 'Temperature_C', 'Area_Hectare', 'Yield_ton_per_hectare'
    ]
    target_column = 'Market_Price_per_ton_INR'
    
    # Check for missing values
    missing_values = df[feature_columns + [target_column]].isnull().sum()
    if missing_values.sum() > 0:
        print(f"  Warning: Found {missing_values.sum()} missing values")
        df = df.dropna(subset=feature_columns + [target_column])
        print(f"  Dropped rows with missing values. Remaining: {len(df)} records")
    else:
        print("  [OK] No missing values found")
    
    # Encode categorical variables
    print("\n[3/7] Encoding categorical features...")
    encoders = {}
    categorical_features = ['Crop_Type', 'Region', 'Season', 'Soil_Type', 'Farmer_Type']
    
    df_encoded = df.copy()
    for feature in categorical_features:
        encoder = LabelEncoder()
        df_encoded[feature] = encoder.fit_transform(df[feature])
        encoders[feature] = encoder
        print(f"  [OK] Encoded {feature}: {len(encoder.classes_)} unique values")
    
    # Prepare features and target
    X = df_encoded[feature_columns]
    y = df_encoded[target_column]
    
    print(f"\n  Feature matrix shape: {X.shape}")
    print(f"  Target range: {y.min():.2f} - {y.max():.2f} INR/ton")
    print(f"  Target mean: {y.mean():.2f} INR/ton")
    
    # Train-test split
    print("\n[4/7] Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"  [OK] Training set: {len(X_train)} samples")
    print(f"  [OK] Test set: {len(X_test)} samples")
    
    # Train RandomForest
    print("\n[5/7] Training RandomForest model...")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    
    # Evaluate RandomForest
    rf_pred = rf_model.predict(X_test)
    rf_r2 = r2_score(y_test, rf_pred)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))
    rf_mae = mean_absolute_error(y_test, rf_pred)
    
    print(f"  [OK] RandomForest trained")
    print(f"    R² Score: {rf_r2:.4f}")
    print(f"    RMSE: {rf_rmse:.2f} INR/ton")
    print(f"    MAE: {rf_mae:.2f} INR/ton")
    
    # Train XGBoost
    print("\n[6/7] Training XGBoost model...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=10,
        learning_rate=0.1,
        random_state=42,
        n_jobs=-1
    )
    xgb_model.fit(X_train, y_train)
    
    # Evaluate XGBoost
    xgb_pred = xgb_model.predict(X_test)
    xgb_r2 = r2_score(y_test, xgb_pred)
    xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_pred))
    xgb_mae = mean_absolute_error(y_test, xgb_pred)
    
    print(f"  [OK] XGBoost trained")
    print(f"    R² Score: {xgb_r2:.4f}")
    print(f"    RMSE: {xgb_rmse:.2f} INR/ton")
    print(f"    MAE: {xgb_mae:.2f} INR/ton")
    
    # Select best model
    print("\n[7/7] Selecting and saving best model...")
    if xgb_r2 > rf_r2:
        best_model = xgb_model
        best_model_name = "XGBoost"
        best_r2 = xgb_r2
        best_rmse = xgb_rmse
        best_mae = xgb_mae
    else:
        best_model = rf_model
        best_model_name = "RandomForest"
        best_r2 = rf_r2
        best_rmse = rf_rmse
        best_mae = rf_mae
    
    print(f"  [OK] Selected model: {best_model_name}")
    print(f"    Final R² Score: {best_r2:.4f}")
    print(f"    Final RMSE: {best_rmse:.2f} INR/ton")
    print(f"    Final MAE: {best_mae:.2f} INR/ton")
    
    # Save model and encoders
    model_dir = os.path.dirname(__file__)
    model_path = os.path.join(model_dir, 'price_prediction_model.pkl')
    encoders_path = os.path.join(model_dir, 'feature_encoders.pkl')
    
    joblib.dump(best_model, model_path)
    joblib.dump({
        'encoders': encoders,
        'feature_columns': feature_columns,
        'model_name': best_model_name
    }, encoders_path)
    
    print(f"\n  [OK] Model saved to: {model_path}")
    print(f"  [OK] Encoders saved to: {encoders_path}")
    
    # Feature importance (if RandomForest or XGBoost)
    print("\n" + "=" * 60)
    print("Feature Importance (Top 5):")
    print("=" * 60)
    
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        feature_importance = pd.DataFrame({
            'feature': feature_columns,
            'importance': importances
        }).sort_values('importance', ascending=False)
        
        for idx, row in feature_importance.head(5).iterrows():
            print(f"  {row['feature']:25s}: {row['importance']:.4f}")
    
    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)

if __name__ == "__main__":
    train_model()
