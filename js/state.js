// js/state.js

/**
 * A simple, centralized store for the application's state.
 * This prevents state from being scattered across the DOM or different scripts.
 * It serves as the single source of truth for the application's current context.
 */
const state = {
    // The currently active mode ('dev', 'trader', or 'social')
    currentMode: 'dev',
    
    // The current language ('en' or 'ar')
    currentLanguage: 'en',
    
    // A history of the conversation
    conversation: [],

    // Tracks if the AI is currently "thinking"
    isLoading: false,

    // Mode-specific options that the user can change
    devOptions: {
        language: 'javascript'
    },
    socialOptions: {
        platform: 'twitter',
        tone: 'professional',
        lang: 'en'
    }
};

export default state;