// js/api.js

/**
 * Real AI API Service.
 * Talks to our own backend (see /server), which holds the Qwen API key
 * and forwards requests to Qwen's OpenAI-compatible chat completions endpoint.
 * The frontend NEVER sees or stores the API key.
 */

const API_ENDPOINT = '/api/complete';
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Requests a completion from the backend.
 * @param {string} mode - 'dev' | 'trader' | 'social'
 * @param {string} prompt - The user's input.
 * @param {object} options - Mode-specific options (language, platform, tone...).
 * @returns {Promise<{content: string, type: string}>}
 */
export async function getCompletion(mode, prompt, options = {}) {
    if (!prompt || !prompt.trim()) {
        throw new Error('Prompt is empty.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
        response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode, prompt, options }),
            signal: controller.signal
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('The request took too long. Please try again.');
        }
        throw new Error('Could not reach the server. Is it running?');
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Server error (${response.status})`);
    }

    const data = await response.json();
    return formatResponse(mode, data.content || '', options);
}

/**
 * Turns the raw model text into the same {content, type} shape the UI layer expects.
 */
function formatResponse(mode, rawText, options) {
    if (mode === 'social') {
        const platform = options.platform || 'twitter';
        const label = platform.charAt(0).toUpperCase() + platform.slice(1);
        return {
            type: 'html',
            content: `<div class="social-outputs"><div class="social-card">
                <div class="social-card-header">
                    <h4>${label}</h4>
                    <button class="copy-btn" data-copy-target="social-${platform}" data-lang-key="copy.button">Copy</button>
                </div>
                <p id="social-${platform}">${escapeHtml(rawText)}</p>
            </div></div>`
        };
    }

    return { type: 'html', content: renderMarkdownLite(rawText) };
}

/**
 * Minimal, dependency-free renderer: escapes HTML, turns ```lang fenced blocks
 * into the app's existing .code-block markup, and preserves line breaks.
 */
function renderMarkdownLite(text) {
    const fenceRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let out = '';
    let match;

    while ((match = fenceRegex.exec(text)) !== null) {
        out += escapeHtml(text.slice(lastIndex, match.index)).replace(/\n/g, '<br>');
        const lang = match[1] || 'plaintext';
        const code = escapeHtml(match[2]);
        out += `<div class="code-block"><button class="copy-btn" data-lang-key="copy.button">Copy</button><pre><code class="language-${lang}">${code}</code></pre></div>`;
        lastIndex = fenceRegex.lastIndex;
    }
    out += escapeHtml(text.slice(lastIndex)).replace(/\n/g, '<br>');
    return out;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
