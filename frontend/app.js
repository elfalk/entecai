// frontend/app.js

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

// عرض الرسالة في واجهة الشات
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender;
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// إرسال الرسالة
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  userInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: text }]
      })
    });

    const data = await response.json();

    if (data.reply) {
      addMessage("bot", data.reply);
    } else {
      addMessage("bot", "⚠️ حصل خطأ في الرد.");
    }
  } catch (err) {
    console.error(err);
    addMessage("bot", "❌ فشل الاتصال بالسيرفر.");
  }
}

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
