import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import os

# Create output dir for graphs
output_dir = 'public/assets/graphs'
os.makedirs(output_dir, exist_ok=True)

print("Loading data...")
try:
    df = pd.read_csv('agriculture_data.csv')
except FileNotFoundError:
    print("Error: agriculture_data.csv not found. Run generate_data.py first.")
    exit(1)

# Preprocessing
df['Date'] = pd.to_datetime(df['Date'])
df['Month'] = df['Date'].dt.month
df['Year'] = df['Date'].dt.year

# Encode Categorical
df_encoded = pd.get_dummies(df, columns=['State', 'District', 'Crop'], drop_first=True)

# Features & Target
X = df_encoded.drop(['Date', 'Market_Price'], axis=1)
y = df['Market_Price']

# Split
print("Training Model...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)
print(f"Model Trained. MAE: INR {mae:.2f}")

# --- Visualizations ---

print("Generating Graphs...")

# 1. Price Trends (Seaonality)
plt.figure(figsize=(10, 6))
sns.lineplot(data=df, x='Month', y='Market_Price', hue='Crop', marker='o')
plt.title('Average Price Trends by Month')
plt.xlabel('Month')
plt.ylabel('Price (₹/Quintal)')
plt.grid(True, alpha=0.3)
plt.savefig(f'{output_dir}/price_trends.png')
plt.close()

# 2. Actual vs Predicted
plt.figure(figsize=(8, 8))
plt.scatter(y_test, preds, alpha=0.5, color='green')
plt.plot([y.min(), y.max()], [y.min(), y.max()], 'r--', lw=2) # Identity line
plt.xlabel('Actual Price')
plt.ylabel('Predicted Price')
plt.title(f'Actual vs Predicted Prices (MAE: ₹{int(mae)})')
plt.savefig(f'{output_dir}/prediction_scatter.png')
plt.close()

# 3. Correlation Heatmap
plt.figure(figsize=(10, 8))
# Select only numeric columns for correlation
numeric_df = df[['Rainfall', 'Yield_Index', 'Market_Price', 'Month']]
sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Feature Correlations')
plt.savefig(f'{output_dir}/correlation_heatmap.png')
plt.close()

print(f"Graphs saved to {output_dir}")
