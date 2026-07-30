// server/server.js
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen3.7-plus';
const PORT = process.env.PORT || 3001;

if (!QWEN_API_KEY) {
    console.warn('[Nexora] WARNING: QWEN_API_KEY is not set in server/.env — /api/complete will return 500 until it is configured.');
}

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '200kb' }));

// Basic abuse protection on the AI endpoint
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use('/api/', limiter);

const SYSTEM_PROMPTS = {
    dev: (options) =>
        `You are an expert senior software engineer embedded in a developer tool called Nexora. ` +
        `The user's preferred language is ${options.language || 'javascript'}. ` +
        `Explain, refactor, or debug whatever code or question they send. Be concise and technically precise. ` +
        `When you show code, use a markdown fenced code block with the language tag (e.g. \`\`\`${options.language || 'javascript'}).`,
    trader: () =>
        `You are a markets analyst assistant inside a trading-companion app called Nexora. ` +
        `Analyze the trade idea or market sentiment the user describes. Flag emotional biases (like FOMO or revenge trading) ` +
        `when you see them, give a rough risk/reward read, and always close with a short reminder that this is not financial advice.`,
    social: (options) =>
        `You are a social media copywriter inside Nexora. Write ONE ${options.tone || 'professional'}-toned post ` +
        `for ${options.platform || 'twitter'} based on the user's idea. Match that platform's typical length, style, ` +
        `and hashtag conventions. Return only the post text, with no preamble or explanation.`
};

app.post('/api/complete', async (req, res) => {
    try {
        const { mode, prompt, options = {} } = req.body || {};

        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({ error: 'A non-empty prompt is required.' });
        }
        if (!SYSTEM_PROMPTS[mode]) {
            return res.status(400).json({ error: `Unknown mode: ${mode}` });
        }
        if (!QWEN_API_KEY) {
            return res.status(500).json({ error: 'Server is missing QWEN_API_KEY. See server/.env.example.' });
        }

        const systemPrompt = SYSTEM_PROMPTS[mode](options);

        const upstream = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${QWEN_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: QWEN_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt.slice(0, 6000) }
                ],
                temperature: mode === 'trader' ? 0.4 : 0.7
            })
        });

        if (!upstream.ok) {
            const errText = await upstream.text();
            console.error('[Nexora] Qwen API error:', upstream.status, errText);
            return res.status(502).json({ error: 'The AI provider returned an error.' });
        }

        const data = await upstream.json();
        const content = data?.choices?.[0]?.message?.content || '';
        res.json({ content });
    } catch (err) {
        console.error('[Nexora] Completion error:', err);
        res.status(500).json({ error: 'Unexpected server error.' });
    }
});

// Serve the static frontend from the project root (one level up from /server)
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
    console.log(`Nexora server running at http://localhost:${PORT}`);
});
