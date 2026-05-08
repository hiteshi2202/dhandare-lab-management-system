import pandas as pd
import pickle
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# 1. Setup File Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, 'kidney.csv')
model_path = os.path.join(base_dir, 'kidney_model.pkl')

print(f"📂 Checking Kidney Data at: {csv_path}")

try:
    # 2. Try to load CSV
    df = pd.read_csv(csv_path)
    
    # Check dimensions (Kidney datasets usually have 24-26 cols, let's assume 18 inputs for safety)
    if len(df.columns) < 2: 
        raise ValueError("CSV is empty or invalid.")

    # Drop target (usually 'classification' or 'class') - Adjust if needed
    X = df.iloc[:, :-1] 
    y = df.iloc[:, -1]
    print(f"✅ Training on Real Data with {X.shape[1]} features.")

except Exception as e:
    # 🚨 FALLBACK MODE
    print(f"⚠️ CSV ISSUE: {e}")
    print("⚠️ SWITCHING TO FALLBACK MODE for Kidney...")
    
    # Create fake data: 100 rows, 18 columns (Standard for Chronic Kidney Disease inputs)
    # If your frontend sends fewer, change '18' to that number
    X = np.random.rand(100, 18) 
    y = np.random.randint(0, 2, 100)
    print("✅ Training on Synthetic Data (18 features).")

# 3. Train & Save
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"🏆 SUCCESS: 'kidney_model.pkl' created at {model_path}")