from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from model_symptom import load_model, predict_disease
from utils.preprocess import preprocess_input
from utils.medicine_info import get_medicines_for_diseases
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model, label_classes, symptom_vocab = load_model()

class SymptomInput(BaseModel):
    age: int
    gender: str
    body_temperature_c: float
    symptoms: List[str]
    duration_days: int
    language: str

@app.post("/analyze-symptoms")
async def analyze_symptoms(data: SymptomInput):
    features = preprocess_input(data, symptom_vocab)
    probs = predict_disease(model, features)

    threshold = 0.1
    diseases = []
    for i, p in enumerate(probs):
        if p > threshold:
            diseases.append({"name": label_classes[i], "confidence": float(p)})

    medicines = []
    for disease in diseases:
        medicines.extend(get_medicines_for_diseases(disease["name"], data.language))

    return {
        "diseases": diseases,
        "medicines": medicines,
        "bmi_recommendation": {
            "message": "Please enter your height and weight for BMI calculation."
        }
    }
