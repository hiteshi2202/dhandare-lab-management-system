import pickle
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Setup Paths
base_dir = os.path.dirname(os.path.abspath(__file__))

print("🚀 Starting SMART Model Training (Optimized for Demo)...")

# ==========================================
# 1. HEART MODEL (7 Inputs)
# Inputs: [Age, Sex, CP, BP, Chol, MaxHR, ExAngina]
# ==========================================
print("❤️ Training Heart Model (7 Features)...")
X_heart = []
y_heart = []

# Generate 500 synthetic patients
for _ in range(500):
    age = np.random.randint(20, 80)
    sex = np.random.randint(0, 2)
    cp = np.random.randint(0, 4)      # Chest Pain
    bp = np.random.randint(90, 180)
    chol = np.random.randint(150, 400)
    max_hr = np.random.randint(70, 200)
    ex_angina = np.random.randint(0, 2)
    
    # MEDICAL LOGIC: High Risk if CP is high OR (BP high AND Chol high)
    if (cp >= 2) or (bp > 140 and chol > 240) or (ex_angina == 1 and max_hr < 120):
        target = 1
    else:
        target = 0
        
    X_heart.append([age, sex, cp, bp, chol, max_hr, ex_angina])
    y_heart.append(target)

model_heart = RandomForestClassifier(n_estimators=50, random_state=42)
model_heart.fit(X_heart, y_heart)
with open(os.path.join(base_dir, 'heart_model.pkl'), 'wb') as f:
    pickle.dump(model_heart, f)
print("✅ Heart Model Saved.")

# ==========================================
# 2. DIABETES MODEL (4 Inputs)
# Inputs: [Glucose, BP, BMI, Age]
# ==========================================
print("🍬 Training Diabetes Model (4 Features)...")
X_dia = []
y_dia = []

for _ in range(500):
    glucose = np.random.randint(70, 200)
    bp = np.random.randint(60, 100)
    bmi = np.random.uniform(18, 45)
    age = np.random.randint(20, 80)
    
    # MEDICAL LOGIC: Risk if Glucose > 140 OR (BMI > 30 and Age > 45)
    if (glucose > 140) or (bmi > 30 and age > 45):
        target = 1
    else:
        target = 0

    X_dia.append([glucose, bp, bmi, age])
    y_dia.append(target)

model_dia = RandomForestClassifier(n_estimators=50, random_state=42)
model_dia.fit(X_dia, y_dia)
with open(os.path.join(base_dir, 'diabetes_model.pkl'), 'wb') as f:
    pickle.dump(model_dia, f)
print("✅ Diabetes Model Saved.")

# ==========================================
# 3. KIDNEY MODEL (5 Inputs)
# Inputs: [Age, BP, Creatinine, Hemoglobin, Albumin]
# ==========================================
print("💧 Training Kidney Model (5 Features)...")
X_kid = []
y_kid = []

for _ in range(500):
    age = np.random.randint(20, 80)
    bp = np.random.randint(60, 120)
    creat = np.random.uniform(0.5, 10.0) # Normal is < 1.2
    hemo = np.random.uniform(5, 17)      # Normal is > 13
    alb = np.random.randint(0, 6)        # Normal is 0
    
    # MEDICAL LOGIC: Risk if Creatinine > 1.4 OR Hemoglobin < 10
    if (creat > 1.4) or (hemo < 10) or (alb > 2):
        target = 1
    else:
        target = 0

    X_kid.append([age, bp, creat, hemo, alb])
    y_kid.append(target)

model_kid = RandomForestClassifier(n_estimators=50, random_state=42)
model_kid.fit(X_kid, y_kid)
with open(os.path.join(base_dir, 'kidney_model.pkl'), 'wb') as f:
    pickle.dump(model_kid, f)
print("✅ Kidney Model Saved.")
print("🏁 ALL MODELS OPTIMIZED!")