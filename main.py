from fastapi import FastAPI, File, UploadFile, HTTPException, Form
import PIL.Image
import tensorflow as tf
import joblib
import json
import numpy as np
import cv2
import io
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai
from PyPDF2 import PdfReader

# =========================
# تحميل .env
# =========================
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ API KEY NOT FOUND")

genai.configure(api_key=api_key.strip())

# =========================
# اختيار موديل Gemini
# =========================
def get_working_model():
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                return m.name
    except Exception as e:
        print(f"Model Error: {e}")
    return "models/gemini-1.5-flash"

model = genai.GenerativeModel(get_working_model())

# =========================
# تحميل موديلات AI
# =========================
try:
    extractor = tf.keras.models.load_model("wound_extractor_model.h5")
    ensemble = joblib.load("wound_ensemble_model.pkl")

    with open("class_indices.json", 'r') as f:
        class_indices = json.load(f)
        labels = list(class_indices.keys())

    print("✅ Models Loaded")
except Exception as e:
    print(f"❌ Model Load Error: {e}")

# =========================
# إنشاء التطبيق
# =========================
app = FastAPI(title="Esafny AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# الصفحة الرئيسية
# =========================
@app.get("/")
def root():
    return {"status": "online"}

# =========================
# دالة التوقع
# =========================
def predict_logic(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    img = cv2.resize(img, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    x = np.expand_dims(img, axis=0)
    x = tf.keras.applications.efficientnet.preprocess_input(x.astype('float32'))

    features = extractor.predict(x, verbose=0)
    proba = ensemble.predict_proba(features)[0]
    idx = np.argmax(proba)

    return labels[idx]

# =========================
# شات Gemini
# =========================
@app.post("/chat")
async def chat(message: str = Form(...)):
    try:
        prompt = f"""
        أنت خبير إسعافات أولية.
        أجب بالعربي في نقاط واضحة وسريعة.

        السؤال: {message}
        """

        response = model.generate_content(prompt)

        return {
            "status": "success",
            "bot_response": response.text or "لم يتم توليد رد"
        }

    except Exception as e:
        print("Chat Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# رفع صورة وتحليلها
# =========================
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        content = await file.read()
        img = PIL.Image.open(io.BytesIO(content))

        prompt = (
            "أنت طبيب طوارئ. حلل الصورة واذكر الإسعافات الأولية."
        )

        response = model.generate_content([prompt, img])

        return {
            "status": "success",
            "bot_response": response.text or "لم يتم التعرف"
        }

    except Exception as e:
        print("Image Error:", e)
        return {
            "status": "error",
            "bot_response": "فشل تحليل الصورة"
        }

# =========================
# توقع الجروح
# =========================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        content = await file.read()

        result = predict_logic(content)

        return {
            "status": "success",
            "prediction": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# =========================
# رفع ملفات عادية
# =========================
# =========================
# رفع ملفات وقراءة PDF
# =========================
@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):

    try:

        content = await file.read()

        file_name = file.filename
        file_type = file.content_type

        # =========================
        # لو صورة
        # =========================
        if file_type.startswith("image/"):

            img = PIL.Image.open(io.BytesIO(content))

            prompt = """
            أنت طبيب طوارئ.

            حلل الصورة الطبية واذكر:
            - نوع الإصابة
            - الإسعافات الأولية
            - هل الحالة خطيرة أم لا

            أجب بالعربي.
            """

            response = model.generate_content([prompt, img])

            return {
                "status": "success",
                "bot_response": response.text
            }

        # =========================
        # لو PDF
        # =========================
        elif file_type == "application/pdf":

            pdf_reader = PdfReader(io.BytesIO(content))

            extracted_text = ""

            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"

            if not extracted_text.strip():
                return {
                    "status": "error",
                    "bot_response": "لم أستطع قراءة محتوى الـ PDF"
                }

            prompt = f"""
            أنت مساعد طبي ذكي.

            هذا محتوى ملف PDF:

            {extracted_text[:5000]}

            المطلوب:
            - تلخيص المحتوى
            - استخراج أهم المعلومات الطبية
            - الرد بالعربي بشكل منظم
            """

            response = model.generate_content(prompt)

            return {
                "status": "success",
                "bot_response": response.text
            }

        # =========================
        # أي ملفات أخرى
        # =========================
        else:

            return {
                "status": "success",
                "bot_response": f"تم استلام الملف: {file_name}"
            }

    except Exception as e:

        print("Upload File Error:", e)

        return {
            "status": "error",
            "bot_response": "حدث خطأ أثناء قراءة الملف"
        }
# =========================
# تشغيل السيرفر
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)