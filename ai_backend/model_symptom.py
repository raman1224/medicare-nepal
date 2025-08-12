import tensorflow as tf
import numpy as np
import json

def load_model():
    model = tf.keras.models.load_model("saved_models/symptom_model")
    with open("saved_models/label_classes.json") as f:
        label_classes = json.load(f)
    with open("saved_models/symptom_vocab.json") as f:
        symptom_vocab = json.load(f)
    return model, label_classes, symptom_vocab

def predict_disease(model, features):
    input_arr = np.array([features])
    preds = model.predict(input_arr)[0]
    return preds
