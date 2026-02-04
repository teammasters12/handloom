// js/language.js

let currentLanguage = CONFIG.DEFAULT_LANGUAGE;
let languageStrings = {};

// Get current language
function getCurrentLanguage() {
    return localStorage.getItem('danudara_language') || CONFIG.DEFAULT_LANGUAGE;
}

// Set language
async function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('danudara_language', lang);
    await loadLanguageStrings();
    updatePageLanguage();
}

// Load language strings from JSONBIN
async function loadLanguageStrings() {
    try {
        const content = await JSONBinService.getContent();
        languageStrings = content.languages || {};
    } catch (error) {
        console.error('Failed to load language strings:', error);
        languageStrings = JSONBinService.getDefaultContent().languages;
    }
}

// Get translation
function getTranslation(key) {
    const lang = getCurrentLanguage();
    return languageStrings[lang]?.[key] || languageStrings['en']?.[key] || key;
}

// Get localized text from object
function getLocalizedText(textObj) {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj;
    
    const lang = getCurrentLanguage();
    return textObj[lang] || textObj['en'] || '';
}

// Update all elements with data-lang attribute
function updatePageLanguage() {
    // Update text content
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        element.textContent = getTranslation(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-placeholder');
        element.placeholder = getTranslation(key);
    });
    
    // Update document language
    document.documentElement.lang = currentLanguage;
    
    // Dispatch event for custom handlers
    document.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: currentLanguage }
    }));
}

// Initialize language system
async function initLanguage() {
    currentLanguage = getCurrentLanguage();
    await loadLanguageStrings();
    
    // Set language selector value
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
    
    updatePageLanguage();
}

// Export functions
window.getCurrentLanguage = getCurrentLanguage;
window.setLanguage = setLanguage;
window.getTranslation = getTranslation;
window.getLocalizedText = getLocalizedText;
window.initLanguage = initLanguage;