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
    "half-full": 50,
    "full": 90,
    "overflowing": 100,
    "null": 0
}

def predict_fill(image_path):
    result = client.run_workflow(
    workspace_name="aniruddhas-workspace",
    workflow_id="custom-workflow",
        images={"image": image_path},
        use_cache=True
    )

    predictions = result[0]["predictions"]["predictions"]

    if len(predictions) == 0:
        return "empty", 0, False

    best_prediction = max(predictions, key=lambda x: x["confidence"])

    predicted_class = best_prediction["class"]
    confidence = best_prediction["confidence"]

    if confidence < 0.5:
        return "empty", 0, False

    fill_percentage = FILL_MAP.get(predicted_class, 0)
    cleaning_required = fill_percentage >= 90

    return predicted_class, fill_percentage, cleaning_required


# API endpoint
@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["image"]

    file_path = "temp.jpg"
    file.save(file_path)

    level, percentage, cleaning_required = predict_fill(file_path)

    os.remove(file_path)

    return jsonify({
        "level": level,
        "percentage": percentage,
        "cleaning_required": cleaning_required
    })


if __name__ == "__main__":
    app.run(port=5001)
