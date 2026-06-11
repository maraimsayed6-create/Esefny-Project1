import mysql.connector
import bcrypt

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="3012023", 
        database="firstaid"
    )

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# دالة لحفظ نتيجة التوقع في قاعدة البيانات
def save_prediction(user_id, injury_type):
    db = connect_db()
    cursor = db.cursor()
    query = "INSERT INTO predictions (user_id, injury_type) VALUES (%s, %s)"
    cursor.execute(query, (user_id, injury_type))
    db.commit()
    cursor.close()
    db.close()