import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Settings
NUM_ROWS = 1000
START_DATE = datetime(2023, 1, 1)
CROPS = ['Rice', 'Wheat', 'Onion', 'Tomato', 'Cotton']
DISTRICTS = ['Guntur', 'Warangal', 'Krishna', 'Nizamabad', 'Khammam']

data = []

# Base Prices (approx ₹/quintal)
base_prices = {
    'Rice': 2200,
    'Wheat': 2400,
    'Onion': 1500,
    'Tomato': 1200,
    'Cotton': 5500
}

# Seasonality Factors (Month 1-12)
# 1.0 = Normal, >1.0 = High Price (Off-season), <1.0 = Low Price (Harvest)
seasonality = {
    'Rice':   [1.0, 1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 0.8, 0.9], # Harvest in Nov/Dec
    'Wheat':  [1.0, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1], # Harvest in Mar/Apr
    'Onion':  [1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.1, 1.3, 1.5, 1.3, 1.1, 1.0], # Volatile
    'Tomato': [1.1, 1.0, 0.9, 0.8, 1.2, 1.5, 1.4, 1.0, 0.9, 1.0, 1.1, 1.2], # Summer high
    'Cotton': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9, 0.8, 0.9, 1.0]  # Stable
}

print("Generating synthetic agriculture data...")

for i in range(NUM_ROWS):
    # Random Date
    days_offset = random.randint(0, 365 * 2) # 2 Years
    date = START_DATE + timedelta(days=days_offset)
    month = date.month - 1 # 0-11 index
    
    crop = random.choice(CROPS)
    district = random.choice(DISTRICTS)
    
    # Factors
    rain = random.uniform(0, 200) # mm rainfall
    yield_factor = random.uniform(0.8, 1.2) # Yield variation
    
    # Logic: More Rain (up to a point) -> Better Yield -> Lower Price
    # Too much rain -> Crop Damage -> Higher Price
    if rain > 150:
        yield_factor *= 0.7 # Damage
    elif rain > 50:
        yield_factor *= 1.1 # Good rain
        
    # Calculate Price
    # Base * Season * (1/Yield) * Random Noise
    price = base_prices[crop] * seasonality[crop][month] * (1 / yield_factor)
    price += random.uniform(-200, 200) # Noise
    price = round(price)
    
    data.append([date.strftime("%Y-%m-%d"), 'Telangana', district, crop, round(rain,1), round(yield_factor, 2), price])

df = pd.DataFrame(data, columns=['Date', 'State', 'District', 'Crop', 'Rainfall', 'Yield_Index', 'Market_Price'])
df.to_csv('agriculture_data.csv', index=False)
print(f"Data generated: {len(df)} rows saved to agriculture_data.csv")
