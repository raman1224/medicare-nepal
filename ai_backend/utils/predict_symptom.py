# This file is optional because prediction logic is in model_symptom.py
# But if you want, you can define helper functions here

def predict_symptom_from_input(model, features):
    preds = model.predict([features])[0]
    return preds
