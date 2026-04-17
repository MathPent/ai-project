from fastapi import FastAPI, UploadFile, File
import random
import uvicorn

app = FastAPI()

PLANT_TYPES = ["Tomato", "Potato", "Corn", "Wheat", "Apple"]
DISEASES = ["Healthy", "Early Blight", "Late Blight", "Leaf Spot", "Rust"]

REMEDIES = {
    "Healthy": "No treatment required. Keep watering and providing adequate sunlight.",
    "Early Blight": "Remove affected leaves. Apply copper-based fungicide. Water at base to avoid wetting leaves.",
    "Late Blight": "Remove and destroy all infected plants. Use preventive fungicidal sprays.",
    "Leaf Spot": "Ensure good air circulation. Avoid overhead watering. Use a fungicide if severe.",
    "Rust": "Remove infected leaves. Apply sulfur powder or a rust-specific fungicide."
}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # In a real scenario, we'd pass the file through a PyTorch/TensorFlow Model here
    contents = await file.read()
    
    # Mocking classification
    plant = random.choice(PLANT_TYPES)
    disease = random.choice(DISEASES)
    confidence = round(random.uniform(0.75, 0.99), 4)

    return {
        "plant_type": plant,
        "disease": disease,
        "confidence": confidence,
        "remedy": REMEDIES[disease]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
