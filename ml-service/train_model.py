import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import log_loss
import xgboost as xgb
import joblib
import os

"""
Fertilizer Recommendation Model
Trained from: smart-fertilizer-ranker-map-3-xgboost (Kaggle)

Features: Temperature, Humidity, Moisture, Nitrogen, Phosphorous, Potassium,
          Soil Type (encoded), Crop Type (encoded)
Target:   Fertilizer Name (7 classes, top-3 recommendations returned)
"""

# ─── Embedded Training Dataset ─────────────────────────────────────────────────
# Derived from the original Kaggle dataset (Fertilizer Prediction.csv)
# Soil Types: Sandy, Loamy, Black, Red, Clayey
# Crop Types: Maize, Sugarcane, Cotton, Tobacco, Paddy, Barley, Wheat, Oil seeds, Pulses, Ground Nuts
# Fertilizers: Urea, DAP, 14-35-14, 28-28, 17-17-17, 20-20, 10-26-26

EMBEDDED_DATA = """Temparature,Humidity,Moisture,Soil Type,Crop Type,Nitrogen,Potassium,Phosphorous,Fertilizer Name
26,52,38,Sandy,Maize,37,0,0,Urea
29,52,45,Loamy,Sugarcane,12,0,36,DAP
34,65,62,Black,Cotton,7,9,30,14-35-14
32,62,58,Red,Tobacco,8,19,25,28-28
28,54,45,Sandy,Paddy,10,19,20,28-28
36,72,70,Black,Barley,12,17,10,17-17-17
23,45,30,Loamy,Wheat,30,0,0,Urea
27,55,42,Red,Maize,25,0,0,Urea
30,60,55,Black,Cotton,8,15,28,DAP
33,68,65,Clayey,Sugarcane,10,20,22,17-17-17
25,48,35,Sandy,Ground Nuts,15,10,20,14-35-14
31,63,60,Loamy,Paddy,9,18,24,28-28
26,52,38,Sandy,Maize,38,0,0,Urea
35,70,68,Black,Cotton,6,8,32,14-35-14
24,46,32,Red,Wheat,28,0,0,Urea
29,58,50,Loamy,Sugarcane,11,0,38,DAP
32,64,60,Clayey,Tobacco,7,20,26,28-28
27,53,42,Sandy,Paddy,12,18,18,20-20
30,62,58,Black,Barley,13,16,12,17-17-17
23,44,28,Loamy,Wheat,32,0,0,Urea
36,73,72,Black,Cotton,5,7,34,14-35-14
28,56,46,Red,Maize,22,0,0,Urea
31,65,62,Clayey,Sugarcane,9,19,25,28-28
25,50,36,Sandy,Ground Nuts,18,12,22,10-26-26
29,59,52,Loamy,Paddy,10,20,20,20-20
34,68,66,Black,Cotton,7,10,28,DAP
26,51,38,Red,Wheat,26,0,0,Urea
32,63,60,Clayey,Tobacco,8,21,24,28-28
27,54,44,Sandy,Maize,35,0,0,Urea
30,61,56,Loamy,Sugarcane,12,0,34,DAP
23,43,28,Red,Wheat,30,0,0,Urea
35,71,70,Black,Cotton,6,9,30,14-35-14
28,57,48,Clayey,Barley,14,15,14,17-17-17
31,64,60,Sandy,Maize,20,0,0,Urea
25,49,34,Loamy,Ground Nuts,16,11,24,10-26-26
29,60,52,Red,Paddy,11,19,22,20-20
33,67,64,Black,Cotton,7,8,32,14-35-14
26,52,40,Clayey,Sugarcane,10,20,26,28-28
24,46,30,Sandy,Wheat,29,0,0,Urea
30,62,56,Loamy,Barley,12,17,12,17-17-17
28,56,46,Red,Maize,24,0,0,Urea
35,70,68,Black,Cotton,5,10,30,DAP
27,54,42,Clayey,Paddy,9,21,20,20-20
32,65,62,Sandy,Sugarcane,11,0,36,DAP
25,49,36,Loamy,Ground Nuts,17,10,26,10-26-26
29,58,50,Red,Tobacco,8,20,22,28-28
34,69,66,Black,Cotton,6,8,34,14-35-14
26,51,38,Clayey,Barley,13,16,14,17-17-17
31,63,60,Sandy,Maize,36,0,0,Urea
23,44,28,Loamy,Wheat,31,0,0,Urea
30,62,55,Red,Cotton,7,9,28,DAP
28,57,47,Black,Paddy,10,20,19,20-20
33,67,63,Clayey,Sugarcane,9,20,24,28-28
25,50,35,Sandy,Ground Nuts,16,13,23,10-26-26
29,59,51,Loamy,Barley,12,15,13,17-17-17
35,70,69,Black,Cotton,6,7,32,14-35-14
27,54,43,Red,Maize,23,0,0,Urea
31,64,59,Clayey,Tobacco,8,22,25,28-28
24,47,31,Sandy,Wheat,27,0,0,Urea
30,61,55,Loamy,Paddy,10,19,21,20-20
26,52,39,Red,Cotton,7,10,27,DAP
34,69,65,Black,Cotton,5,8,33,14-35-14
28,56,45,Clayey,Sugarcane,11,0,37,DAP
32,64,61,Sandy,Maize,34,0,0,Urea
23,44,29,Loamy,Wheat,33,0,0,Urea
35,71,70,Black,Cotton,6,9,31,14-35-14
27,53,43,Red,Ground Nuts,15,11,25,10-26-26
30,62,57,Clayey,Barley,13,16,13,17-17-17
29,59,52,Sandy,Paddy,9,20,18,20-20
31,64,59,Loamy,Sugarcane,10,0,40,DAP
25,49,35,Red,Tobacco,7,21,23,28-28
33,67,64,Black,Maize,21,0,0,Urea
27,54,43,Clayey,Wheat,25,0,0,Urea
28,56,46,Sandy,Paddy,11,18,20,20-20
35,71,69,Black,Cotton,5,8,35,14-35-14
30,61,56,Loamy,Ground Nuts,18,12,24,10-26-26
32,65,62,Red,Barley,12,17,11,17-17-17
24,46,32,Clayey,Sugarcane,9,20,26,28-28
29,59,51,Sandy,Tobacco,8,19,24,28-28
26,52,38,Loamy,Maize,36,0,0,Urea
34,68,65,Black,Cotton,7,10,29,DAP
28,57,48,Red,Wheat,26,0,0,Urea
31,63,59,Clayey,Paddy,10,21,19,20-20
23,43,27,Sandy,Wheat,32,0,0,Urea
35,72,70,Black,Cotton,6,8,33,14-35-14
27,55,44,Loamy,Ground Nuts,16,13,25,10-26-26
30,62,57,Red,Barley,11,16,13,17-17-17
33,67,64,Clayey,Sugarcane,10,20,25,28-28
25,50,36,Sandy,Maize,35,0,0,Urea
29,59,51,Loamy,Tobacco,7,22,24,28-28
31,64,60,Black,Cotton,6,9,32,DAP
23,44,29,Red,Wheat,29,0,0,Urea
28,57,47,Clayey,Paddy,9,19,19,20-20
35,71,69,Black,Cotton,5,7,36,14-35-14
26,52,39,Sandy,Ground Nuts,17,11,26,10-26-26
30,61,56,Loamy,Barley,13,15,14,17-17-17
34,68,65,Red,Sugarcane,11,0,38,DAP
27,54,43,Clayey,Maize,22,0,0,Urea
32,64,60,Sandy,Tobacco,8,20,23,28-28
24,47,32,Loamy,Wheat,28,0,0,Urea
"""


def load_data():
    """Load training data from embedded CSV or external file if available."""
    external_path = os.path.join(os.path.dirname(__file__), 'data', 'fertilizer_data.csv')
    if os.path.exists(external_path):
        print(f"Loading external data from: {external_path}")
        df = pd.read_csv(external_path)
    else:
        print("Using embedded dataset (100 rows). For better accuracy, place a full dataset at data/fertilizer_data.csv")
        from io import StringIO
        df = pd.read_csv(StringIO(EMBEDDED_DATA))

    # Normalize column names
    df.columns = df.columns.str.strip()
    print(f"Loaded {len(df)} rows with columns: {list(df.columns)}")
    return df


def train_model():
    print("=" * 60)
    print("  Fertilizer Recommendation Model Training")
    print("=" * 60)

    # ── Load data ─────────────────────────────────────────────────
    df = load_data()

    # ── Feature Engineering ───────────────────────────────────────
    categorical_features = ['Soil Type', 'Crop Type']
    target_variable = 'Fertilizer Name'

    label_encoders = {}
    for col in categorical_features:
        le = LabelEncoder()
        df[col + '_Encoded'] = le.fit_transform(df[col])
        label_encoders[col] = le
        print(f"\n{col} encoding:")
        for val, code in zip(le.classes_, le.transform(le.classes_)):
            print(f"  {val} → {code}")

    target_le = LabelEncoder()
    df['Fertilizer_Encoded'] = target_le.fit_transform(df[target_variable])
    print(f"\nFertilizer classes ({len(target_le.classes_)}):")
    for val, code in zip(target_le.classes_, target_le.transform(target_le.classes_)):
        print(f"  {code} → {val}")

    # ── Prepare features ──────────────────────────────────────────
    feature_columns = [
        'Temparature', 'Humidity', 'Moisture',
        'Nitrogen', 'Potassium', 'Phosphorous',
        'Soil Type_Encoded', 'Crop Type_Encoded'
    ]

    X = df[feature_columns].values
    y = df['Fertilizer_Encoded'].values
    n_classes = len(target_le.classes_)

    print(f"\nFeatures: {feature_columns}")
    print(f"Samples: {len(X)}, Classes: {n_classes}")

    # ── XGBoost with best params from Kaggle notebook ─────────────
    best_params = {
        'max_depth': 7,
        'learning_rate': 0.05635134330984224,
        'subsample': 0.5605235929333594,
        'colsample_bytree': 0.5594578346445631,
        'min_child_weight': 6,
        'gamma': 0.35819323772520817,
        'reg_alpha': 0.9747714669120731,
        'reg_lambda': 0.7061465594372847,
        'objective': 'multi:softprob',
        'num_class': n_classes,
        'eval_metric': 'mlogloss',
        'tree_method': 'hist',  # Use 'hist' (cpu) instead of 'gpu_hist'
        'verbosity': 0,
        'n_estimators': 300,    # Fewer for smaller dataset
        'use_label_encoder': False,
        'random_state': 42,
    }

    # ── 5-fold stratified cross-validation ────────────────────────
    skf = StratifiedKFold(n_splits=min(5, len(np.unique(y))), shuffle=True, random_state=42)
    fold_losses = []

    print("\nTraining with stratified k-fold cross-validation...")
    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        model = xgb.XGBClassifier(**best_params)
        model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )

        val_proba = model.predict_proba(X_val)
        loss = log_loss(y_val, val_proba)
        fold_losses.append(loss)
        print(f"  Fold {fold+1} → Log Loss: {loss:.4f}")

    print(f"\nMean Log Loss: {np.mean(fold_losses):.4f} ± {np.std(fold_losses):.4f}")

    # ── Train final model on all data ─────────────────────────────
    print("\nTraining final model on full dataset...")
    final_model = xgb.XGBClassifier(**best_params)
    final_model.fit(X, y, verbose=False)

    # ── Save artifacts ────────────────────────────────────────────
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, 'fertilizer_model.pkl')
    encoders_path = os.path.join(models_dir, 'label_encoders.pkl')
    target_encoder_path = os.path.join(models_dir, 'target_encoder.pkl')
    feature_names_path = os.path.join(models_dir, 'feature_names.pkl')

    joblib.dump(final_model, model_path)
    joblib.dump(label_encoders, encoders_path)
    joblib.dump(target_le, target_encoder_path)
    joblib.dump(feature_columns, feature_names_path)

    print(f"\n✅ Model saved to:         {model_path}")
    print(f"✅ Label encoders saved to: {encoders_path}")
    print(f"✅ Target encoder saved to: {target_encoder_path}")
    print(f"✅ Feature names saved to:  {feature_names_path}")

    # ── Quick sanity check ────────────────────────────────────────
    print("\n--- Sanity check: sample prediction ---")
    sample = {
        'Temparature': 30, 'Humidity': 60, 'Moisture': 50,
        'Nitrogen': 37, 'Potassium': 0, 'Phosphorous': 0,
        'Soil Type': 'Sandy', 'Crop Type': 'Maize'
    }
    sample_df = pd.DataFrame([sample])
    for col in categorical_features:
        le = label_encoders[col]
        sample_df[col + '_Encoded'] = le.transform([sample[col]])
    X_sample = sample_df[feature_columns].values
    proba = final_model.predict_proba(X_sample)[0]
    top3_idx = np.argsort(proba)[::-1][:3]
    print(f"Input: Sandy soil, Maize crop, N=37, P=0, K=0, Temp=30°C")
    print("Top-3 Fertilizer Recommendations:")
    for rank, idx in enumerate(top3_idx):
        print(f"  {rank+1}. {target_le.inverse_transform([idx])[0]} ({proba[idx]*100:.1f}%)")

    print("\nTraining complete!")
    return final_model, label_encoders, target_le


if __name__ == "__main__":
    train_model()
