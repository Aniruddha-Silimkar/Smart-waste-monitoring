from flask import Flask, request, jsonify
from inference_sdk import InferenceHTTPClient
import os

app = Flask(__name__)

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "SmartWaste Model API is running", "service": "python-inference"})

# client = InferenceHTTPClient(
#     api_url="https://serverless.roboflow.com",
#     api_key="elTjeBiR1X7U6lyTRtd4"   # keep your key here
# )
client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="n41kmiLX7Wo2xNIyGNSf"
)

FILL_MAP = {
    "empty": 0,
    "half": 50,
    "half-full": 50,
    "half_full": 50,
    "half full": 50,
    "full": 90,
    "overflowing": 100,
    "null": 0
}

def predict_fill(image_path):
    try:
        result = client.run_workflow(
            workspace_name="aniruddhas-workspace",
            workflow_id="custom-workflow",
            images={"image": image_path},
            use_cache=True
        )

        predictions = result[0]["predictions"]["predictions"]

        if len(predictions) == 0:
            return "empty", 0, False

        best_prediction = max(predictions, key=lambda x: x.get("confidence", 0))

        predicted_class = str(best_prediction.get("class", "")).lower().strip()
        confidence = float(best_prediction.get("confidence", 0))

        if confidence < 0.2:
            return "empty", 0, False

        fill_percentage = FILL_MAP.get(predicted_class, 50)

        standard_class = "empty"
        if fill_percentage >= 100:
            standard_class = "overflowing"
        elif fill_percentage >= 90:
            standard_class = "full"
        elif fill_percentage >= 50:
            standard_class = "half-full"

        cleaning_required = fill_percentage >= 90

        return standard_class, fill_percentage, cleaning_required
    except Exception as e:
        print(f"Roboflow inference error: {e}")
        return "empty", 0, False


import tempfile
import uuid

# API endpoint
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    temp_filename = f"upload_{uuid.uuid4().hex}.jpg"
    file_path = os.path.join(tempfile.gettempdir(), temp_filename)

    level = "empty"
    percentage = 0
    cleaning_required = False

    try:
        file.save(file_path)
        level, percentage, cleaning_required = predict_fill(file_path)
    except Exception as err:
        print(f"Prediction route exception: {err}")
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

    return jsonify({
        "level": level,
        "percentage": percentage,
        "cleaning_required": cleaning_required
    })


if __name__ == "__main__":
    app.run(port=5001)
