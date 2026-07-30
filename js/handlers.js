// js/handlers.js
import state from './state.js';
import * as ui from './ui.js';
import { getCompletion } from './api.js';
import { setLanguage } from './i18n.js';

/**
 * Handlers Module.
 * Connects user events (clicks, submissions) to the application logic.
 */

/**
 * Handles the submission of the main prompt form.
 * @param {Event} e - The form submission event.
 */
export async function handleFormSubmit(e) {
    e.preventDefault();
    const promptInput = document.querySelector('[data-prompt-input]');
    const prompt = promptInput.value.trim();

    if (!prompt || state.isLoading) return;

    ui.addChatBubble('user', prompt);
    ui.clearInput();
    ui.toggleLoading(true);

    try {
        // Prepare options based on the current mode
        let options = {};
        if (state.currentMode === 'dev') {
            options = state.devOptions;
        } else if (state.currentMode === 'social') {
            options = state.socialOptions;
        }

        const response = await getCompletion(state.currentMode, prompt, options);
        ui.addChatBubble('assistant', response.content);
        // Re-apply translations if the response contains new translatable elements
        setLanguage(state.currentLanguage);
    } catch (error) {
        console.error('Error getting completion:', error);
        ui.addChatBubble('assistant', 'Sorry, something went wrong. Please try again.');
    } finally {
        ui.toggleLoading(false);
        promptInput.focus();
    }
}

/**
 * Handles clicks on mode switcher buttons.
 * @param {Event} e - The click event.
 */
export function handleModeChange(e) {
    const button = e.target.closest('.mode-btn');
    if (button && !state.isLoading) {
        const newMode = button.dataset.mode;
        if (newMode !== state.currentMode) {
            state.currentMode = newMode;
            ui.updateModeUI(newMode);
        }
    }
}

/**
 * Handles changes in the language selection dropdown.
 * @param {Event} e - The change event.
 */
export function handleLanguageChange(e) {
    const newLang = e.target.value;
    state.currentLanguage = newLang;
    setLanguage(newLang);
    // Also update the UI for the current mode to reflect language changes in controls
    ui.updateModeUI(state.currentMode);
}

/**
 * Handles clicks on various action buttons (e.g., settings, copy).
 * @param {Event} e - The click event.
 */
export function handleGlobalClick(e) {
    const actionTarget = e.target.closest('[data-action]');
    if (actionTarget) {
        const action = actionTarget.dataset.action;
        if (action === 'toggle-settings') {
            ui.toggleSettingsPanel();
        }
    }
    
    const copyTarget = e.target.closest('.copy-btn');
    if(copyTarget) {
        handleCopy(copyTarget);
    }
}

/**
 * Handles changes in dynamic control inputs (e.g., selects).
 * @param {Event} e - The change event.
 */
export function handleControlChange(e) {
    const control = e.target.closest('[data-control]');
    if (!control) return;

    const controlType = control.dataset.control;
    const value = control.value;

    switch (controlType) {
        case 'dev-language':
            state.devOptions.language = value;
            break;
        case 'social-platform':
            state.socialOptions.platform = value;
            break;
        case 'social-tone':
            state.socialOptions.tone = value;
            break;
    }
}

/**
 * Handles the copy to clipboard functionality.
 * @param {HTMLElement} button - The copy button that was clicked.
 */
function handleCopy(button) {
    const targetId = button.dataset.copyTarget;
    let textToCopy = '';

    if (targetId) { // For social cards
        const targetElement = document.getElementById(targetId);
        if (targetElement) textToCopy = targetElement.innerText;
    } else { // For code blocks
        const codeBlock = button.closest('.code-block');
        const pre = codeBlock.querySelector('pre');
        if (pre) textToCopy = pre.innerText;
    }
    
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = button.textContent;
            button.textContent = translations[state.currentLanguage]['copy.success'] || 'Copied!';
            button.style.color = 'var(--success-color)';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
}

// Dummy translations for the copy button success message
const translations = {
    en: { "copy.success": "Copied!" },
    ar: { "copy.success": "تم النسخ!" }
};