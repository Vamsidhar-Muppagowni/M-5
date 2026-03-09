import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

print("Loading dataset...")
data_path = "Crop_recommendation.csv"
if not os.path.exists(data_path):
    print(f"Error: {data_path} not found.")
    exit(1)

df = pd.read_csv(data_path)
print(f"Loaded {len(df)} rows.")

# Features and target
# Dataset features: N, P, K, temperature, humidity, ph, rainfall
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

print("Encoding target labels...")
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)

print("Training XGBoost Classifier...")
model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42,
    use_label_encoder=False,
    eval_metric='mlogloss'
)

model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"Model trained successfully. Accuracy on test set: {accuracy*100:.2f}%")

print("Saving model and encoders...")
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/crop_model.pkl')
joblib.dump(label_encoder, 'models/crop_label_encoder.pkl')

print("Done! Model artifacts saved to ml-service/models/")
