let patientInfo = {
  name: '',
  email: '',
  gender: '',
  age: ''
};

let authMode = "login";

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {

  setTimeout(() => goTo('loginScreen'), 2500);

  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  const savedUser = localStorage.getItem('patientInfo');
  if (savedUser) {
    patientInfo = JSON.parse(savedUser);
    document.getElementById('displayUserName').innerText =
      patientInfo.name || "مستخدم";
  }

  const theme = localStorage.getItem('userTheme');
  if (theme) applyTheme(theme);
});

// =========================
// NAVIGATION
// =========================
function goTo(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  closePopups();
}

// =========================
// AUTH
// =========================
function setAuthMode(mode) {
  authMode = mode;

  const nameInput = document.getElementById('regName');
  const btn = document.getElementById('authBtn');

  if (mode === 'signup') {
    nameInput.style.display = 'block';
    btn.innerText = "تسجيل";
  } else {
    nameInput.style.display = 'none';
    btn.innerText = "دخول";
  }
}

function handleAuth() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('userEmail').value;
  const pass = document.getElementById('userPass').value;

  if (!email || !pass) {
    alert("من فضلك أدخل البيانات");
    return;
  }

  patientInfo.name = name || "مستخدم";
  patientInfo.email = email;

  localStorage.setItem('patientInfo', JSON.stringify(patientInfo));

  document.getElementById('displayUserName').innerText = patientInfo.name;

  if (authMode === "login") {
    goTo('chatScreen');
  } else {
    goTo('genderScreen');
  }
}

// =========================
// GENDER
// =========================
function selectGender(gender, el) {
  patientInfo.gender = gender;

  document.querySelectorAll('.g-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');

  localStorage.setItem('patientInfo', JSON.stringify(patientInfo));

  setTimeout(() => {
    goTo('ageScreen');
  }, 500);
}

// =========================
// AGE
// =========================
function finishSignup() {
  const age = document.getElementById('userAge').value;

  if (!age) {
    alert("ادخل العمر");
    return;
  }

  patientInfo.age = age;

  localStorage.setItem('patientInfo', JSON.stringify(patientInfo));

  goTo('chatScreen');
}

// =========================
// PROFILE
// =========================
function showProfile() {
  const data = JSON.parse(localStorage.getItem('patientInfo')) || {};

  const profileDiv = document.getElementById('profileDetails');

  profileDiv.innerHTML = `
    <h3>👤 ${data.name || "غير محدد"}</h3>
    <p><b>📧 الإيميل:</b> ${data.email || "-"}</p>
    <p><b>🚻 النوع:</b> ${data.gender || "-"}</p>
    <p><b>🎂 العمر:</b> ${data.age || "-"}</p>
  `;

  goTo('profileScreen');
}

// =========================
// MESSAGES
// =========================
function addMessage(content, type) {
  const area = document.getElementById('messagesArea');
  const div = document.createElement('div');

  div.className = type === 'user' ? 'msg user' : 'msg bot';
  div.innerHTML = content;

  area.appendChild(div);
  area.scrollTop = area.scrollHeight;

  return div;
}

// =========================
// FORMAT RESPONSE
// =========================
function formatBotResponse(text) {
  if (!text) return "❗️ لا يوجد رد";

  return text
    .replace(/\n/g, "<br>")
    .replace(/🩺/g, "<b>🩺</b>")
    .replace(/📖/g, "<b>📖</b>")
    .replace(/⚠️/g, "<b style='color:red'>⚠️</b>")
    .replace(/🧠/g, "<b>🧠</b>")
    .replace(/💊/g, "<b>💊</b>")
    .replace(/🚨/g, "<b style='color:red'>🚨</b>");
}

// =========================
// API
// =========================
async function fetchWithRetry(url, options, retries = 2, timeout = 15000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(id);

      if (!response.ok) {
        if (response.status === 429 && i < retries) {
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        throw new Error("Server Error");
      }

      return await response.json();

    } catch (err) {
      if (i === retries) throw err;
    }
  }
}

// =========================
// CHAT (مسيبها زي ما هي)
// =========================
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();

  if (!text) return;

  addMessage(text, 'user');
  input.value = "";

  const botDiv = addMessage("⏳ جاري التحليل الطبي...", 'bot');

  try {
    const data = await fetchWithRetry(
      "https://mariamsayed17-first-aid-api.hf.space/chat",
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      }
    );

    botDiv.innerHTML = formatBotResponse(
      data.bot_response || data.response || data.text || "❗️ لم يتم الفهم"
    );

  } catch (e) {
    botDiv.innerText = "⚠️ السيرفر مشغول حالياً";
  }
}

// =========================
// IMAGE
// =========================
function handleAttach(type) {
  if (type === 'Camera') {
    document.getElementById('cameraInput').click();
  } else {
    document.getElementById('fileInput').click();
  }

  closePopups();
}

async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    addMessage(
      `<img src="${e.target.result}" style="max-width:200px;border-radius:10px;">`,
      'user'
    );
  };
  reader.readAsDataURL(file);

  const botDiv = addMessage("🧠 جاري تحليل الصورة...", 'bot');

  const formData = new FormData();
  formData.append('file', file);

  try {
    const data = await fetchWithRetry(
      "https://mariamsayed17-first-aid-api.hf.space/predict",
      {
        method: 'POST',
        body: formData
      }
    );

    botDiv.innerHTML = formatBotResponse(
      data.bot_response || data.response || "❗️ لم يتم التعرف"
    );

  } catch (e) {
    botDiv.innerText = "⚠️ فشل التحليل";
  }
}

// =========================
// UI
// =========================
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('active');
}

function toggleAttachMenu(e) {
  e.stopPropagation();
  document.getElementById('attachMenu')?.classList.toggle('active');
}

function closePopups() {
  document.getElementById('sidebar')?.classList.remove('active');
  document.getElementById('attachMenu')?.classList.remove('active');
}

function openNearestHospital() {
  window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
}

function openSettings() {
  document.getElementById('settingsModal').style.display = 'flex';
  toggleSidebar();
}

function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

function closeSettingsExternally(e) {
  if (e.target.id === "settingsModal") closeSettings();
}

function applyTheme(theme) {
  document.body.classList.remove('dark-theme', 'light-theme');

  if (theme === 'dark') document.body.classList.add('dark-theme');
  if (theme === 'light') document.body.classList.add('light-theme');

  localStorage.setItem('userTheme', theme);
}