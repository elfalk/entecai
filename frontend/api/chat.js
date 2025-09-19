// frontend/api/chat.js
// Vercel Serverless Function (Node) — proxy لـ Hugging Face Inference API

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    if (!messages) return res.status(400).json({ error: 'messages required' });

    // حول مصفوفة الرسائل لنص بسيط لتمريره للموديل
    const input = messages.map(m => `${m.role || 'user'}: ${m.content}`).join('\n');

    const HF_API_KEY = process.env.HF_API_KEY;
    const HF_MODEL = process.env.HF_MODEL || 'gpt2';

    if (!HF_API_KEY) return res.status(500).json({ error: 'HF_API_KEY not configured' });

    const hfResp = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: input,
        options: { wait_for_model: true }
      }),
    });

    if (!hfResp.ok) {
      const text = await hfResp.text();
      return res.status(502).json({ error: 'HF error', details: text });
    }

    const data = await hfResp.json();

    // استخراج النص من الرد (يتغير حسب الموديل)
    let reply = '';
    if (typeof data === 'string') reply = data;
    else if (Array.isArray(data) && data[0]?.generated_text) reply = data[0].generated_text;
    else if (data.generated_text) reply = data.generated_text;
    else reply = JSON.stringify(data);

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'server error' });
  }
};
