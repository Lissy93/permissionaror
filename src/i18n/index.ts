// Import the language translations as json
import en from "./en.json";
import de from "./de.json";
import fr from "./fr.json";
import ru from "./ru.json";
import id from "./id.json";
import it from "./it.json";
import es from "./es-ES.json";
import ja from "./ja-JP.json";
import pt from "./pt-BR.json";
import ch from "./zh-CN.json";
import hi from "./hi-IN.json";
import sa from "./ar-SA.json";
import kr from "./ko-KR.json";


// List of supported languages
export const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "zh-CN", label: "中文 (简体)", flag: "🇨🇳" },
  { code: "hi-IN", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ar-SA", label: "العربية", flag: "🇸🇦" },
  { code: "ko-KR", label: "한국어", flag: "🇰🇷" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

// Map of language codes to their respective translation objects
const translations: Record<string, any> = {
  en,
  de,
  fr,
  ru,
  es,
  ja,
  pt,
  id,
  it,
  'zh-CN': ch,
  'hi-IN': hi,
  'ar-SA': sa,
  'ko-KR': kr,
};

// Default language to use for all fallbacks, if missing key/or no language set
const defaultLang = "en";

// Current language state, initialized by detecting the user's preference
let currentLang = detectLang();

/**
 * Detects the user's language preference, based on:
 * 1. Local storage, if they have previously set a language
 * 2. Browser language, if available and their lang is supported
 * 3. Default to English if no preference is found
 */
function detectLang(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("lang");
    if (stored && translations[stored]) return stored;
    const browserLang = navigator.language?.split("-")[0];
    if (browserLang && translations[browserLang]) return browserLang;
  }
  return defaultLang;
}

/**
 * Sets a given language as the current language, and updates storage
 */
export function setLanguage(lang: string) {
  if (translations[lang]) {
    currentLang = lang;
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }
  }
}

/**
 * Returns the currently set language from state (set on initialization or by user)
 */
export function getLanguage() {
  return currentLang;
}

/**
 * Translates a given path using the current language.
 * If the key does not exist in the current lang,
 * then it checks the en translation, otherwise returns the fallback value.
 */
export function t(path: string, fallback = ""): string {
  const value = deepGet(translations[currentLang], path);
  if (value !== undefined) return value;

  // fallback to English if key exists there
  const fallbackValue = deepGet(translations.en, path);
  return fallbackValue !== undefined ? fallbackValue : fallback || path;
}

/**
 * Gets a value from the translations object using a dot-separated path.
 * If the value is not found in the current language, it checks the default language.
 * If still not found, returns the provided fallback value.
 */
export function get(path: string, fallback: any = {}): any {
  const value = deepGet(translations[currentLang], path);
  if (value !== undefined) return value;
  const fallbackValue = deepGet(translations[defaultLang], path);
  return fallbackValue !== undefined ? fallbackValue : fallback;
}

/**
 * Deeply retrieves a value from an object using a dot-separated path.
 * Returns undefined if the path does not exist.
 */
function deepGet(obj: any, path: string) {
  return path.split(".").reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
}
