const chatEl = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('input');

const messages = []; // {role:'user'|'assistant', content:''}

function append(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  append('user', text);
  messages.push({ role: 'user', content: text });
  input.value = '';
  append('assistant', '...'); // placeholder
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ messages })
    });
    const j = await res.json();
    // استبدل آخر رسالة assistant بالنص الحقيقي
    const last = chatEl.querySelector('.assistant:last-child');
    if (j.reply) {
      last.textContent = j.reply;
      messages.push({ role: 'assistant', content: j.reply });
    } else {
      last.textContent = 'خطأ في الاستجابة';
    }
  } catch (err) {
    console.error(err);
    const last = chatEl.querySelector('.assistant:last-child');
    last.textContent = 'خطأ في الاتصال';
  }
});
