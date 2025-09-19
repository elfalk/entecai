// server/server.js
const express = require('express');
const fetch = require('node-fetch'); // npm i node-fetch@2
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit'); // npm i express-rate-limit

const app = express();
app.use(bodyParser.json());
app.use(express.static('../frontend', { index: 'index.html' }));

// حماية بسيطة
const limiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة
  max: 30, // 30 طلب/دقيقة لكل IP (اضبط حسب الحاجة)
});
app.use('/api/', limiter);

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || 'gpt2'; // غيّر للموديل اللي تختاره

if (!HF_API_KEY) {
  console.warn('⚠️ HF_API_KEY غير مضبوط في متغيرات البيئة');
}

// endpoint للدردشة
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body; // array of messages or a single string
    if (!messages) return res.status(400).json({ error: 'messages required' });

    // نص بسيط لتمريره للموديل (عدّل حسب نوع موديل HF اللي هتستخدمه)
    const input = messages.map(m => `${m.role || 'user'}: ${m.content}`).join('\n');

    const hfResp = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: input, options: { wait_for_model: true } }),
    });

    if (!hfResp.ok) {
      const text = await hfResp.text();
      return res.status(502).json({ error: 'HF error', details: text });
    }

    const data = await hfResp.json();
    // المفروض تفهم شكل الرد حسب الموديل — هنا مثال عام
    const reply = (data.generated_text || data[0]?.generated_text || JSON.stringify(data)).toString();

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
