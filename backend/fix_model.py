import joblib
import warnings

# We ignore the warning just so we can load it one last time
with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    try:
        model = joblib.load("wellness_regressor.pkl")
        print("Model loaded successfully...")
        
        # This saves it using your current scikit-learn (1.8.0)
        joblib.dump(model, "wellness_regressor.pkl")
        print("Success! wellness_regressor.pkl has been updated to version 1.8.0.")
    except Exception as e:
        print(f"Error: {e}")