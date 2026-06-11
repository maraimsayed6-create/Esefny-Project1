import tensorflow as tf
import numpy as np
import cv2
import joblib
import json
import os

# --- 1. إعداد المسارات (تأكد أن الملفات في نفس الفولدر) ---
MODEL_EXTRACTOR_PATH = "wound_extractor_model.h5"
MODEL_ENSEMBLE_PATH = "wound_ensemble_model.pkl"
JSON_PATH = "class_indices.json"

def load_resources():
    """دالة لتحميل الموديلات والبيانات مرة واحدة"""
    if not os.path.exists(MODEL_EXTRACTOR_PATH) or not os.path.exists(MODEL_ENSEMBLE_PATH):
        print("Error: Model files not found!")
        return None, None, None
        
    extractor = tf.keras.models.load_model(MODEL_EXTRACTOR_PATH)
    ensemble = joblib.load(MODEL_ENSEMBLE_PATH)
    
    with open(JSON_PATH, 'r') as f:
        class_indices = json.load(f)
        labels = list(class_indices.keys())
        
    return extractor, ensemble, labels

def run_prediction(image_path, extractor, ensemble, labels):
    """دالة تأخذ مسار الصورة وتعطي التوقع"""
    # 1. قراءة ومعالجة الصورة
    img = cv2.imread(image_path)
    if img is None:
        return "Error: Image not found at the path."
    
    img_res = cv2.resize(img, (224, 224))
    img_rgb = cv2.cvtColor(img_res, cv2.COLOR_BGR2RGB)
    
    # 2. Preprocessing
    x = np.expand_dims(img_rgb, axis=0)
    x = tf.keras.applications.efficientnet.preprocess_input(x.astype('float32'))
    
    # 3. التوقع
    features = extractor.predict(x, verbose=0)
    probs = ensemble.predict_proba(features)[0]
    idx = np.argmax(probs)
    
    confidence = probs[idx] * 100 # نسبة التأكد
    return labels[idx], confidence

# --- الجزء الخاص بتجربة الكود (Standalone) ---
if __name__ == "__main__":
    print("--- Starting Prediction Script ---")
    
    # تحميل الموارد
    ext, ens, lbls = load_resources()
    
    if ext:
        # هنا حط مسار أي صورة عندك على الجهاز عشان تجرب
        test_image = "test.jpg" 
        
        if os.path.exists(test_image):
            result, conf = run_prediction(test_image, ext, ens, lbls)
            print(f"\nResult: {result}")
            print(f"Confidence: {conf:.2f}%")
        else:
            print(f"\nPlease put an image named '{test_image}' in the folder to test.")