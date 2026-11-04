// Vercel serverless function: POST { image: base64 JPEG } -> board reading as JSON.
// Keeps GEMINI_API_KEY on the server so it never ships to the browser.
import { PROMPT } from '../src/lib/prompt.js';

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

// Used when the main model is overloaded, which Gemini's free tier often is.
const FALLBACK_MODEL = 'gemini-flash-lite-latest';
const TIMEOUT_MS = 25000;
const BUSY = [429, 503, 504];

async function generate(model, key, body) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    return { status: r.status, data: await r.json() };
  } catch (e) {
    if (e.name !== 'TimeoutError') throw e;
    return { status: 504, data: { error: { message: `${model} timed out` } } };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  const image = req.body && req.body.image;
  if (!image) return res.status(400).json({ error: 'Missing image' });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const body = {
    contents: [{ role: 'user', parts: [
      { text: PROMPT + `\n\nFor reference only, today is ${today}. Do not use it to change what is printed.` },
      { inline_data: { mime_type: 'image/jpeg', data: image } }
    ] }],
    generationConfig: { temperature: 0, responseMimeType: 'application/json' }
  };

  try {
    let { status, data } = await generate(model, key, body);
    if (BUSY.includes(status) && model !== FALLBACK_MODEL) ({ status, data } = await generate(FALLBACK_MODEL, key, body));
    if (status !== 200) return res.status(status).json({ error: data.error?.message || 'Gemini request failed' });
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    const json = JSON.parse(text.replace(/^```json\s*|```$/g, '').trim());
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
