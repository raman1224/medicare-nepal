import numpy as np

GENDER_MAP = {"male": 0, "female": 1, "other": 2}

def preprocess_input(data, symptom_vocab):
    symptom_vector = np.zeros(len(symptom_vocab))
    for symptom in data.symptoms:
        sym_lower = symptom.strip().lower()
        if sym_lower in symptom_vocab:
            idx = symptom_vocab.index(sym_lower)
            symptom_vector[idx] = 1

    gender_encoded = GENDER_MAP.get(data.gender.lower(), 2)

    age_norm = data.age / 100
    temp_norm = data.body_temperature_c / 45
    duration_norm = data.duration_days / 30

    features = np.concatenate((
        symptom_vector,
        [gender_encoded, age_norm, temp_norm, duration_norm]
    ))
    return features
