let patientInfo = { name: '', email: '', gender: '', age: '' };

// 1. تشغيل أولي وإعداد المستمعين
document.addEventListener('DOMContentLoaded', () => {
    // الانتقال لصفحة اللوجن بعد 2.5 ثانية
    setTimeout(() => goTo('loginScreen'), 2500);

    // تطبيق الثيم المحفوظ
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) applyTheme(savedTheme);

    // مستمع لزر الإدخال في الشات
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

// 2. التنقل بين الصفحات
function goTo(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    closePopups();
}

// 3. نظام التسجيل والدخول
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
        if (!patientInfo.email || !patientInfo.name) return alert("أكمل البيانات");
        goTo('genderScreen');
    } else {
        if (!patientInfo.email) return alert("ادخل البريد");
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
    if (!age) return alert("أدخل عمرك");

    patientInfo.age = age;
    document.getElementById('displayUserName').innerText = patientInfo.name;
    goTo('chatScreen');
}

// 4. إدارة القوائم
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function toggleAttachMenu(e) {
    e.stopPropagation();
    document.getElementById('attachMenu').classList.toggle('active');
}
function openImages() {

    document.getElementById('imageInput').click();

    document.getElementById('attachMenu').classList.remove('active');
}

function closePopups() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('attachMenu').classList.remove('active');
}

// 5. وظائف الشات والربط بالباك إند
function addMessage(content, type) {
    const messagesArea = document.getElementById('messagesArea');
    const messageDiv = document.createElement('div');
    
    // تحديد الكلاس بناءً على النوع
    messageDiv.className = type === 'user'
    ? 'msg user'
    : 'msg bot';
    
    // التحقق إذا كان المحتوى نصاً أم كود HTML (مثل الصور)
    if (content.startsWith('<img')) {
        messageDiv.innerHTML = content;
    } else {
        messageDiv.innerText = content;
    }
    
    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return messageDiv;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;

    addMessage(text, 'user');
    input.value = ''; 
    
    const tempBotDiv = addMessage("جاري التفكير...", 'bot');

    try {
        // تأكدي أن السيرفر يعمل على بورت 8000
        const response = await fetch("http://127.0.0.1:8000/chat", { 
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'message': text })
        });

        const data = await response.json();
        if (response.ok) {
            tempBotDiv.innerText = data.bot_response; 
        } else {
            tempBotDiv.innerText = "عذراً، حدث خطأ في الخادم.";
        }
    } catch (e) {
        tempBotDiv.innerText = "فشل الاتصال.. تأكدي من تشغيل السيرفر (Uvicorn).";
        console.error("Error:", e);
    }
}

// 6. رفع الصور ومعالجتها
async function handleImageSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        addMessage(
            `<img src="${e.target.result}" style="max-width:200px;border-radius:10px;">`,
            'user'
        );
    };

    reader.readAsDataURL(file);
}



// 7. الإعدادات والثيم
function openSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
    toggleSidebar();
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'dark') document.body.classList.add('dark-theme');
    if (theme === 'light') document.body.classList.add('light-theme');
    localStorage.setItem('userTheme', theme);
}

function openNearestHospital() {
    window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
}

function showProfile() {

    document.getElementById('profileDetails').innerHTML = `
        <p><strong>الاسم:</strong> ${patientInfo.name || "غير متوفر"}</p>
        <p><strong>البريد:</strong> ${patientInfo.email || "غير متوفر"}</p>
        <p><strong>النوع:</strong> ${patientInfo.gender || "غير متوفر"}</p>
        <p><strong>العمر:</strong> ${patientInfo.age || "غير متوفر"}</p>
    `;

    goTo('profileScreen');
}
function showInstructions() {
    goTo('instructionsScreen');
}

function logout() {

    patientInfo = {
        name: '',
        email: '',
        gender: '',
        age: ''
    };

    goTo('loginScreen');
}

function closeSettingsExternally(event) {

    if (event.target.id === 'settingsModal') {
        closeSettings();
    }
}