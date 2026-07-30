// js/main.js
import state from './state.js';
import * as ui from './ui.js';
import { setLanguage } from './i18n.js';
import {
    handleFormSubmit,
    handleModeChange,
    handleLanguageChange,
    handleGlobalClick,
    handleControlChange
} from './handlers.js';

/**
 * Application bootstrap.
 * Wires DOM events to the handlers module and performs the initial render.
 * This is the single entry point loaded by app.html.
 */
document.addEventListener('DOMContentLoaded', () => {
    const inputForm = document.querySelector('[data-input-form]');
    const modeSwitcher = document.querySelector('.mode-switcher');
    const languageSelect = document.getElementById('language-select');
    const promptInput = document.querySelector('[data-prompt-input]');
    const dynamicControls = document.querySelector('[data-dynamic-controls]');

    inputForm?.addEventListener('submit', handleFormSubmit);
    modeSwitcher?.addEventListener('click', handleModeChange);
    languageSelect?.addEventListener('change', handleLanguageChange);
    dynamicControls?.addEventListener('change', handleControlChange);

    // Single delegated listener for all other clicks (settings, copy buttons, etc.)
    document.body.addEventListener('click', handleGlobalClick);

    // Auto-resize the textarea as the user types
    promptInput?.addEventListener('input', ui.autoResizeTextarea);

    // Enter submits, Shift+Enter adds a newline
    promptInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            inputForm?.requestSubmit();
        }
    });

    // Initial render
    ui.updateModeUI(state.currentMode);
    setLanguage(state.currentLanguage);
});
