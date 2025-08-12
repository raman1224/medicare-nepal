import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import tensorflow as tf
import json

# Load dataset
df = pd.read_csv("data/symptoms.csv")

# Assume columns: 'disease', 'symptoms' (comma-separated string)

# Build symptom vocabulary
all_symptoms = set()
for symptoms_str in df['symptoms']:
    for s in symptoms_str.split(','):
        all_symptoms.add(s.strip().lower())
symptom_vocab = sorted(list(all_symptoms))

def symptoms_to_vector(symptoms_list):
    vec = np.zeros(len(symptom_vocab))
    for s in symptoms_list:
        if s in symptom_vocab:
            vec[symptom_vocab.index(s)] = 1
    return vec

# Prepare features and labels
X = np.array([symptoms_to_vector(s.split(',')) for s in df['symptoms']])
le = LabelEncoder()
y = le.fit_transform(df['disease'])

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build model
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(len(symptom_vocab),)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(len(le.classes_), activation='softmax')
])

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

model.fit(X_train, y_train, epochs=30, batch_size=16, validation_data=(X_test, y_test))

# Save model and metadata
model.save("saved_models/symptom_model")

with open("saved_models/label_classes.json", "w") as f:
    json.dump(le.classes_.tolist(), f)
with open("saved_models/symptom_vocab.json", "w") as f:
    json.dump(symptom_vocab, f)

print("Model training complete and saved!")
