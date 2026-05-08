import sys, json, pickle, os, numpy as np

# Kidney Model
MODEL_FILE = 'kidney_model.pkl' 

base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, MODEL_FILE)

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2: raise Exception("No Data")
        input_data = json.loads(sys.argv[1])
        
        if isinstance(input_data, dict):
            input_data = list(input_data.values())

        features = np.array(input_data).reshape(1, -1)
        
        if not os.path.exists(model_path): raise Exception("Model Missing")
        
        with open(model_path, 'rb') as f: model = pickle.load(f)
        
        print(model.predict(features)[0])
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)