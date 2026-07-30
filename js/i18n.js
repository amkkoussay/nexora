// js/i18n.js

/**
 * Internationalization (i18n) module.
 * Contains language strings and the logic to apply translations to the UI.
 */

const translations = {
    en: {
        "welcome.header": "Welcome to Nexora",
        "welcome.subheader": "Select a mode and start your amplified thinking.",
        "status.thinking": "Thinking...",
        "settings.title": "Settings",
        "settings.language": "Language",
        "settings.theme": "Theme",
        "settings.theme.dark": "Dark (Default)",
        "copy.button": "Copy",
        "copy.success": "Copied!",
        "dev.language": "Language",
        "social.platform": "Platform",
        "social.tone": "Tone",
        "social.lang": "Language",
        "social.lang.msa": "MSA",
        "social.lang.dialect": "Dialect",
        "trader.upload": "Upload Screenshot (mock)",
    },
    ar: {
        "welcome.header": "أهلاً بك في نيكسورا",
        "welcome.subheader": "اختر وضعاً وابدأ بتعزيز أفكارك.",
        "status.thinking": "يفكر...",
        "settings.title": "الإعدادات",
        "settings.language": "اللغة",
        "settings.theme": "السمة",
        "settings.theme.dark": "داكن (افتراضي)",
        "copy.button": "نسخ",
        "copy.success": "تم النسخ!",
        "dev.language": "لغة البرمجة",
        "social.platform": "المنصة",
        "social.tone": "النبرة",
        "social.lang": "اللغة",
        "social.lang.msa": "فصحى",
        "social.lang.dialect": "عامية",
        "trader.upload": "رفع لقطة شاشة (تجريبي)",
    }
};

/**
 * Applies the selected language to all elements with a `data-lang-key` attribute.
 * @param {string} lang - The language code to apply (e.g., 'en', 'ar').
 */
export function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}