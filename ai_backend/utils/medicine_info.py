import csv

MEDICINES_DATA = []
with open("data/medicines.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        MEDICINES_DATA.append(row)

def get_medicines_for_diseases(disease_name, language):
    meds = []
    for med in MEDICINES_DATA:
        if med["disease"].lower() == disease_name.lower():
            meds.append({
                "name": med.get(f"name_{language}", med.get("name_english", "Unknown")),
                "image_url": med.get("image_url", ""),
                "description": med.get(f"description_{language}", med.get("description_english", "")),
                "dosage": med.get(f"dosage_{language}", med.get("dosage_english", "")),
                "food_routine": med.get(f"food_routine_{language}", med.get("food_routine_english", "")),
                "nutrition": {
                    "calories": med.get("calories", ""),
                    "protein_g": med.get("protein_g", "")
                },
                "price": med.get("price", ""),
                "language": language
            })
    return meds
