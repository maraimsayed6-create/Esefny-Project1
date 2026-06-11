def get_first_aid(injury):
    # تحويل المدخل لـ small لضمان المطابقة
    injury = injury.lower().strip()
    
    data = {
        "burn": {
            "steps": ["ضع الجزء المصاب تحت ماء بارد لمدة 10 دقائق", "لا تضع الثلج مباشرة على الحرق", "غط الحرق بشاش معقم"],
            "medicine": ["Panthenol cream", "MEBO ointment"]
        },
        "cut": {
            "steps": ["اغسل الجرح بالماء النظيف", "اضغط على الجرح لإيقاف النزيف", "ضع شاش أو لاصق طبي"],
            "medicine": ["Betadine مطهر", "Fucidin cream"]
        },
        "bruise": {
            "steps": ["ضع كمادات ثلج لمدة 10 دقائق", "ارفع الجزء المصاب"],
            "medicine": ["Hirudoid cream", "Paracetamol للألم"]
        },
        "abrasion": {
            "steps": ["نظف الجرح بالماء والصابون", "ضع مطهر", "غط الجرح بشاش"],
            "medicine": ["Betadine", "Fucidin cream"]
        },
        "laceration": {
            "steps": ["اضغط على الجرح لوقف النزيف", "غط الجرح بشاش معقم"],
            "medicine": ["Betadine مطهر"]
        },
        "normal skin": {
            "steps": ["لا يوجد جرح ظاهر"],
            "medicine": ["لا حاجة لدواء فقط اغسل يدك بالماء"]
        }
    }
    return data.get(injury, {"steps": ["استشر طبيب"], "medicine": ["غير محدد"]})