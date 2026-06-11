let patientInfo = { name: '', email: '', gender: '', age: '' };

document.addEventListener('DOMContentLoaded', () => {
    // الانتقال التلقائي بعد السبلش
    setTimeout(() => goTo('loginScreen'), 2500);

    // تفعيل زر Enter للإرسال
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

// وظيفة التنقل بين الصفحات
function goTo(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    closePopups();
}

function setAuthMode(mode) {
    const isSignup = mode === 'signup';
    document.getElementById('regName').style.display = isSignup ? 'block' : 'none';
    document.getElementById('authBtn').innerText = isSignup ? 'التالي' : 'دخول';
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(isSignup ? 'tabSignup' : 'tabLogin').classList.add('active');
}

function handleAuth() {
    patientInfo.email = document.getElementById('userEmail').value;
    patientInfo.name = document.getElementById('regName').value || "مستخدم";
    const isSignup = document.getElementById('regName').style.display === 'block';
    
    if (isSignup) {
        if (!patientInfo.email || !patientInfo.name) { alert("أكمل البيانات"); return; }
        goTo('genderScreen');
    } else {
        if (!patientInfo.email) { alert("ادخل البريد"); return; }
        document.getElementById('displayUserName').innerText = patientInfo.name;
        goTo('chatScreen');
    }
}

function selectGender(g, btn) {
    patientInfo.gender = g;
    document.querySelectorAll('.g-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = 'white';
    });
    btn.style.background = 'white';
    btn.style.color = '#365492';
}

function finishSignup() {
    const age = document.getElementById('userAge').value;
    if (!age) { alert("أدخل عمرك"); return; }
    patientInfo.age = age;
    document.getElementById('displayUserName').innerText = patientInfo.name;
    goTo('chatScreen');
}

// القوائم
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function toggleAttachMenu(e) { 
    e.stopPropagation(); 
    document.getElementById('attachMenu').classList.toggle('active'); 
}
function closePopups() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('attachMenu').classList.remove('active');
}

// فتح الخرائط
function openNearestHospital() {
    window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
}

function addMessage(text, type) {
    const area = document.getElementById('messagesArea');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerText = text;
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
}

function showProfile() {
    const details = document.getElementById('profileDetails');
    details.innerHTML = `
        <h2>ملف المريض</h2>
        <p><b>الاسم:</b> ${patientInfo.name}</p>
        <p><b>البريد:</b> ${patientInfo.email}</p>
        <p><b>النوع:</b> ${patientInfo.gender}</p>
        <p><b>العمر:</b> ${patientInfo.age}</p>
    `;
    goTo('profileScreen');
}// وظائف الإعدادات
function openSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
    toggleSidebar(); // نقفل السايد بار لما نفتح الإعدادات
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function closeSettingsExternally(e) {
    if (e.target.id === 'settingsModal') closeSettings();
}

function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'dark') document.body.classList.add('dark-theme');
    if (theme === 'light') document.body.classList.add('light-theme');
    
    // حفظ الاختيار عشان لما يقفل ويفتح يلاقيه موجود
    localStorage.setItem('userTheme', theme);
}

// تعديل بسيط في الـ DOMContentLoaded عشان يفتكر الثيم
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) applyTheme(savedTheme);
    
    // باقي الكود بتاعك زي ما هو...
    setTimeout(() => goTo('loginScreen'), 2500);
});
// دالة إضافة الرسائل للشاشة عشان شكل الشات يكمل
// 1. دالة إضافة الرسائل للشاشة بالتنسيق الخاص بكِ
// فتح اختيار الصور أو الكاميرا
// 1. تحديث دالة إضافة الرسائل لتدعم الصور والنصوص
function addMessage(content, type) {
    const messagesArea = document.getElementById('messagesArea');
    const messageDiv = document.createElement('div');
    
    if (type === 'user') {
        messageDiv.className = 'msg user-msg';
    } else {
        messageDiv.className = 'msg bot';
    }
    
    // استخدمنا innerHTML عشان لو بعتنا وسوم <img> تظهر كصورة
    messageDiv.innerHTML = content; 
    
    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    return messageDiv;
}

// 2. الدوال الجديدة للصور (زي ما إنتي كتبتيها مع تعديل بسيط)
function handleAttach(type) {
    document.getElementById('fileInput').click();
    // إغلاق القائمة لو كانت مفتوحة
    const menu = document.getElementById('attachMenu');
    if (menu) menu.classList.remove('active');
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // معاينة الصورة في الشات
    const reader = new FileReader();
    reader.onload = function(e) {
        addMessage(`<img src="${e.target.result}" style="max-width:100%; border-radius:10px; margin-top:5px;">`, 'user');
    };
    reader.readAsDataURL(file);

    const tempBotDiv = addMessage("جاري تحليل الصورة طبيًا...", 'bot');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch("http://127.0.0.1:8000/upload-image", {
            method: 'POST',
            body: formData 
        });

        const data = await response.json();
        tempBotDiv.innerText = data.bot_response;
    } catch (e) {
        tempBotDiv.innerText = "حدث خطأ أثناء محاولة تحليل الصورة.";
        console.error(e);
    }
}
function handleAttach(type) {
    if (type === 'Camera') {
        // هيفتح الكاميرا فوراً في أغلب أجهزة الأندرويد والآيفون
        document.getElementById('cameraInput').click();
    } else {
        // هيفتح اختيار الصور من الجهاز
        document.getElementById('fileInput').click();
    }
    
    // إغلاق قائمة المرفقات
    const menu = document.getElementById('attachMenu');
    if (menu) menu.classList.remove('active');
}
// 3. إضافة ميزة الإرسال عند الضغط على زر Enter
document.getElementById('chatInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});