import tensorflow as tf
import joblib
import json

from tensorflow.keras.models import load_model
from tensorflow.keras.layers import InputLayer
from tensorflow.keras import mixed_precision

# =========================
# 🔧 FIX COMPATIBILITY
# =========================

def custom_input_layer(*args, kwargs):
    if "batch_shape" in kwargs:
        batch_shape = kwargs.pop("batch_shape")
        kwargs["shape"] = batch_shape[1:]

    kwargs.pop("optional", None)
    return InputLayer(*args, kwargs)


def custom_dtype_policy(*args, **kwargs):
    return mixed_precision.Policy("float32")


# =========================
# 🧠 LOAD MODELS ONLY
# =========================

MODEL_EXTRACTOR_PATH = "wound_extractor_model.h5"
MODEL_ENSEMBLE_PATH = "wound_ensemble_model.pkl"
JSON_PATH = "class_indices.json"

print("Loading models...")

extractor = load_model(
    MODEL_EXTRACTOR_PATH,
    custom_objects={
        "InputLayer": custom_input_layer,
        "DTypePolicy": custom_dtype_policy
    },
    compile=False
)

ensemble = joblib.load(MODEL_ENSEMBLE_PATH)

with open(JSON_PATH, "r") as f:
    class_indices = json.load(f)

print("✅ Models loaded successfully")