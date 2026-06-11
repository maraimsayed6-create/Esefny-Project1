import requests

# نصيحة: استخدم API Key حقيقي من Google Cloud Console وفعل الـ Places API
API_KEY = "YOUR_GOOGLE_MAPS_API_KEY" 

def find_hospital(lat, lng):
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=5000&type=hospital&key={API_KEY}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # التأكد إن فيه نتائج قبل ما نختار أول واحدة
        if data.get("results"):
            hospital = data["results"][0]
            return {
                "status": "success",
                "name": hospital["name"],
                "address": hospital.get("vicinity", "العنوان غير متوفر"),
                "lat": hospital["geometry"]["location"]["lat"],
                "lng": hospital["geometry"]["location"]["lng"]
            }
        else:
            return {"status": "error", "message": "لم يتم العثور على مستشفيات قريبة"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}