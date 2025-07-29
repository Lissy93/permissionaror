// src/i18n/index.js
import en from './en.json';

// TODO later: make this dynamic (e.g. from cookies or user setting)
const currentLang = 'en';

const translations = {
  en
};

/**
 * Recursively fetches a translation using dot notation
 * e.g. t('subheadings.aboutChmod') → "What is chmod?"
 */
export function t(path, fallback = '') {
  const parts = path.split('.');
  let result = translations[currentLang];

  for (const part of parts) {
    if (result?.[part] !== undefined) {
      result = result[part];
    } else {
      return fallback || path; // fallback to path or default
    }
  }

  return result;
}

/**
 * Get full namespace object (useful for loops)
 * e.g. get('what.commonPresets') → [{ number: ..., description: ... }]
 */
export function get(path, fallback = []) {
  return t(path, fallback);
}
