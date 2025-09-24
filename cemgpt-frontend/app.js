// Global değişkenler
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let currentChatId = null;
let chatHistory = [];
let chatCounter = 0;

// Mikrofon butonu
document.getElementById("mic").addEventListener("click", toggleRecording);

// Yeni Sohbet butonu
document.querySelector(".new-chat-btn").addEventListener("click", () => {
  createNewChat();
  renderMessages();   // orta panel sıfırlansın
  renderTranscript(); // transcript paneli sıfırlansın
});

// === Mikrofon ===
function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    startMicAnimation();

    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      updateMicStatus("Kayıt durduruldu, işleniyor...", false);

      const formData = new FormData();
      formData.append("file", audioBlob, "user_audio.webm");

      try {
        const response = await fetch("http://127.0.0.1:8000/conversation", {
          method: "POST",
          body: formData
        });
        const data = await response.json();

        // Kullanıcı mesajı
        addMessage(data.user_transcript, "user");
        updateTranscript(data.user_transcript, "user");

        // Bot cevabı
        addMessage(data.bot_answer, "bot");
        updateTranscript(data.bot_answer, "bot");

        // Bot sesi
        if (data.audio_file) {
          const audio = new Audio("http://127.0.0.1:8000" + data.audio_file + "?t=" + Date.now());

          const botWaveContainer = document.getElementById("botWaveContainer");
          botWaveContainer.classList.remove("bot-not-speaking");
          botWaveContainer.classList.add("bot-speaking");

          audio.play();

          audio.onended = () => {
            botWaveContainer.classList.remove("bot-speaking");
            botWaveContainer.classList.add("bot-not-speaking");
          };
        }

        updateMicStatus("Hazır. Yeni kayıt için tekrar tıklayın.", false);
      } catch (err) {
        console.error("❌ Backend hatası:", err);
        updateMicStatus("Bir hata oluştu!", false);
      }
    };

    mediaRecorder.start();
    isRecording = true;
    updateMicStatus("Kayıt yapılıyor... Konuşmaya başlayın", true);

  } catch (error) {
    console.error("❌ Mikrofon erişim hatası:", error);
    updateMicStatus("Mikrofon erişimi reddedildi", false);
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    stopMicAnimation();
    isRecording = false;
  }
}

// === Mikrofon UI ===
function startMicAnimation() {
  document.querySelector(".mic-container").classList.add("recording");
  document.getElementById("mic").classList.add("recording");
}
function stopMicAnimation() {
  document.querySelector(".mic-container").classList.remove("recording");
  document.getElementById("mic").classList.remove("recording");
}
function updateMicStatus(message, active) {
  const statusElement = document.querySelector(".mic-status");
  statusElement.textContent = message;
  statusElement.style.color = active ? "#ef4444" : "var(--text-secondary)";
}

// === Sohbet Yönetimi ===
function createNewChat() {
  chatCounter++;
  const chatId = `chat_${chatCounter}`;
  const chatTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const newChat = { 
    id: chatId, 
    title: `Sohbet ${chatCounter}`, 
    time: chatTime, 
    messages: [], 
    transcripts: [] // ✅ transcriptler burada saklanacak
  };

  chatHistory.unshift(newChat);
  currentChatId = chatId;

  renderChatList();
}

function renderChatList() {
  const chatHistoryContainer = document.getElementById("chatHistory");
  chatHistoryContainer.innerHTML = "";

  if (chatHistory.length === 0) {
    chatHistoryContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <p>Henüz sohbet yok</p>
        <span>Yeni sohbet başlatın</span>
      </div>`;
    return;
  }

  chatHistory.forEach(chat => {
    const item = document.createElement("div");
    item.className = `chat-item ${chat.id === currentChatId ? "active" : ""}`;

    // Başlık
    const titleDiv = document.createElement("div");
    titleDiv.className = "chat-title";
    titleDiv.textContent = chat.title;

    // Saat
    const timeDiv = document.createElement("div");
    timeDiv.className = "chat-time";
    timeDiv.textContent = chat.time;

    // Seçenek butonu (...)
    const menuBtn = document.createElement("button");
    menuBtn.className = "chat-options-btn";
    menuBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';

    // Menü
    const menu = document.createElement("div");
    menu.className = "chat-options-menu hidden";
    menu.innerHTML = `
      <div class="chat-option rename">Yeniden Adlandır</div>
    `;

    // Menü toggle
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".chat-options-menu").forEach(m => m.classList.add("hidden"));
      menu.classList.toggle("hidden");
    });

    // Yeniden adlandır
    menu.querySelector(".rename").addEventListener("click", (e) => {
      e.stopPropagation();
      const newName = prompt("Yeni sohbet adı:", chat.title);
      if (newName && newName.trim() !== "") {
        chat.title = newName.trim();
        renderChatList();
      }
    });

    // Sohbet açma
    item.addEventListener("click", () => {
      currentChatId = chat.id;
      renderChatList();
      renderMessages();
      renderTranscript();
    });

    item.appendChild(titleDiv);
    item.appendChild(timeDiv);
    item.appendChild(menuBtn);
    item.appendChild(menu);

    chatHistoryContainer.appendChild(item);
  });

  // Menü dışında bir yere tıklayınca menüyü kapat
  document.addEventListener("click", () => {
    document.querySelectorAll(".chat-options-menu").forEach(m => m.classList.add("hidden"));
  });
}

// === Orta Panel ===
function addMessage(content, type) {
  const currentChat = chatHistory.find(chat => chat.id === currentChatId);
  if (currentChat) {
    currentChat.messages.push({ type, content, timestamp: new Date() });
  }

  const messagesContainer = document.getElementById("messages");
  const welcomeMessage = messagesContainer.querySelector(".welcome-message");
  if (welcomeMessage) welcomeMessage.style.display = "none";

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;

  const header = document.createElement("div");
  header.className = "message-header";
  header.innerHTML =
    type === "user"
      ? '<i class="fas fa-user"></i> Siz'
      : '<i class="fas fa-robot"></i> CEMGPT';

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.textContent = content;

  messageDiv.appendChild(header);
  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderMessages() {
  const messagesContainer = document.getElementById("messages");
  messagesContainer.innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon"><i class="fas fa-robot"></i></div>
      <h2>Merhaba! Size nasıl yardımcı olabilirim?</h2>
      <p>Mikrofon butonuna basarak konuşmaya başlayabilirsiniz.</p>
    </div>`;
}

// === Transcript Paneli ===
function updateTranscript(text, role) {
  const currentChat = chatHistory.find(chat => chat.id === currentChatId);
  if (!currentChat) return;

  currentChat.transcripts.push({ role, text }); // belleğe kaydet
  renderTranscript();
}

function renderTranscript() {
  const transcriptContainer = document.getElementById("transcripts");
  transcriptContainer.innerHTML = "";

  const currentChat = chatHistory.find(chat => chat.id === currentChatId);
  if (!currentChat || currentChat.transcripts.length === 0) {
    transcriptContainer.innerHTML = `
      <div class="transcript-placeholder">
        <i class="fas fa-microphone-slash"></i>
        <p>Konuşma başladığında transkript burada görünecek</p>
      </div>`;
    return;
  }

  currentChat.transcripts.forEach(msg => {
    const transcriptItem = document.createElement("div");
    transcriptItem.className = `transcript-message ${msg.role}`;
    transcriptItem.innerHTML = `
      <div class="message-header">
        ${msg.role === "user" ? '<i class="fas fa-user"></i> Siz' : '<i class="fas fa-robot"></i> CEMGPT'}
      </div>
      <div class="message-content">${msg.text}</div>
    `;
    transcriptContainer.appendChild(transcriptItem);
  });

  transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
}

// Canlı transkript temizleme butonu
document.querySelector(".clear-transcript-btn").addEventListener("click", () => {
  const currentChat = chatHistory.find(chat => chat.id === currentChatId);
  if (currentChat) {
    currentChat.transcripts = []; // bellekteki transcriptleri temizle
  }
  renderTranscript(); // sağ paneli yeniden çiz
});

// === İlk yüklemede otomatik sohbet oluştur ===
window.onload = () => {
  if (chatHistory.length === 0) {
    createNewChat();
    renderMessages();   // orta panel hoş geldin
    renderTranscript(); // transcript placeholder
  }
};
