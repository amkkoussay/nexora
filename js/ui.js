// js/ui.js
import state from './state.js';
import { setLanguage } from './i18n.js';

/**
 * UI Module.
 * Contains all functions that directly manipulate the DOM.
 * This keeps rendering logic separate from business logic.
 */

// DOM element references
const DOMElements = {
    conversationArea: document.querySelector('[data-conversation-area]'),
    promptInput: document.querySelector('[data-prompt-input]'),
    inputForm: document.querySelector('[data-input-form]'),
    submitBtn: document.querySelector('.submit-btn'),
    loadingIndicator: document.querySelector('[data-loading-indicator]'),
    welcomeMessage: document.querySelector('.welcome-message'),
    dynamicControls: document.querySelector('[data-dynamic-controls]'),
    settingsPanel: document.querySelector('[data-settings-panel]'),
};

/**
 * Renders a new chat bubble in the conversation area.
 * @param {string} sender - 'user' or 'assistant'.
 * @param {string} message - The message content (can be HTML).
 */
export function addChatBubble(sender, message) {
    if (DOMElements.welcomeMessage) {
        DOMElements.welcomeMessage.style.display = 'none';
    }
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = `<p>${message}</p>`;
    DOMElements.conversationArea.appendChild(bubble);
    DOMElements.conversationArea.scrollTop = DOMElements.conversationArea.scrollHeight;
}

/**
 * Toggles the loading state of the UI.
 * @param {boolean} isLoading - Whether to show or hide the loading indicator.
 */
export function toggleLoading(isLoading) {
    state.isLoading = isLoading;
    DOMElements.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    DOMElements.submitBtn.disabled = isLoading;
    DOMElements.promptInput.disabled = isLoading;
    if (isLoading) {
        DOMElements.conversationArea.scrollTop = DOMElements.conversationArea.scrollHeight;
    }
}

/**
 * Clears the user's prompt input field.
 */
export function clearInput() {
    DOMElements.promptInput.value = '';
    DOMElements.promptInput.style.height = 'auto';
}

/**
 * Updates the UI to reflect the currently active mode.
 * @param {string} mode - The mode to switch to ('dev', 'trader', 'social').
 */
export function updateModeUI(mode) {
    // Update active button
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update input placeholder and class
    DOMElements.promptInput.classList.toggle('dev-mode-input', mode === 'dev');
    const placeholders = {
        dev: 'Paste code or ask a question...',
        trader: 'Describe your trade idea or market sentiment...',
        social: 'Enter a topic or idea to generate content for...',
    };
    DOMElements.promptInput.placeholder = placeholders[mode];
    
    // Clear conversation
    DOMElements.conversationArea.innerHTML = '';
    DOMElements.welcomeMessage.style.display = 'block';

    // Update dynamic controls
    renderDynamicControls(mode);
}

/**
 * Renders the mode-specific controls above the input bar.
 * @param {string} mode - The current active mode.
 */
function renderDynamicControls(mode) {
    let controlsHTML = '';
    switch (mode) {
        case 'dev':
            controlsHTML = `
                <div class="control-group">
                    <label for="dev-lang-select" data-lang-key="dev.language">Language</label>
                    <select id="dev-lang-select" data-control="dev-language">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                    </select>
                </div>`;
            break;
        case 'trader':
            controlsHTML = `
                <div class="control-group">
                    <button data-lang-key="trader.upload">Upload Screenshot (mock)</button>
                </div>`;
            break;
        case 'social':
            controlsHTML = `
                <div class="control-group">
                    <label for="social-platform-select" data-lang-key="social.platform">Platform</label>
                    <select id="social-platform-select" data-control="social-platform">
                        <option value="twitter">Twitter/X</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="social-tone-select" data-lang-key="social.tone">Tone</label>
                    <select id="social-tone-select" data-control="social-tone">
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="funny">Funny</option>
                    </select>
                </div>`;
            break;
    }
    DOMElements.dynamicControls.innerHTML = controlsHTML;
    // Re-apply translations to newly added elements
    setLanguage(state.currentLanguage);
}

/**
 * Toggles the visibility of the settings panel.
 */
export function toggleSettingsPanel() {
    DOMElements.settingsPanel.classList.toggle('open');
}

/**
 * Handles auto-resizing of the textarea input.
 */
export function autoResizeTextarea() {
    DOMElements.promptInput.style.height = 'auto';
    DOMElements.promptInput.style.height = `${DOMElements.promptInput.scrollHeight}px`;
}