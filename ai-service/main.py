from fastapi import FastAPI, UploadFile, File
import numpy as np
import tensorflow as tf
import cv2

app = FastAPI()

# Load TFLite model
interpreter = tf.lite.Interpreter(
    model_path="pothole_classifier.tflite"
)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

IMG_SIZE = 224

@app.get("/")
def root():
    return {"status": "AI service running"}

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Invalid image"}

    # Preprocess
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)

    # Inference
    interpreter.set_tensor(input_details[0]['index'], img)
    interpreter.invoke()
    prediction = interpreter.get_tensor(output_details[0]['index'])[0][0]

    label = "Pothole" if prediction > 0.5 else "Plain Road"

    return {
        "issue_type": label,
        "confidence": round(float(prediction), 3)
    }

