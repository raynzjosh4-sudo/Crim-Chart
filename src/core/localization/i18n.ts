import { useCallback, useEffect, useState } from 'react';
import { LanguageCode, TranslationKey, translations } from './translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

// A simple store for the current language
let currentLanguage: LanguageCode = 'en';

const LANGUAGE_KEY = '@crimchart_language';

// Fallback detection (Manual or system if available)
const detectedLocale = 'en';
if (translations[detectedLocale as LanguageCode]) {
  currentLanguage = detectedLocale as LanguageCode;
}

const listeners = new Set<(lang: LanguageCode) => void>();

export const getLanguage = () => currentLanguage;

export const setLanguage = async (lang: LanguageCode) => {
  if (translations[lang]) {
    currentLanguage = lang;
    listeners.forEach(l => l(lang));
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }
};

// Initialize language from storage
AsyncStorage.getItem(LANGUAGE_KEY).then((lang) => {
  if (lang && translations[lang as LanguageCode]) {
    currentLanguage = lang as LanguageCode;
    listeners.forEach(l => l(lang as LanguageCode));
  }
});

export const t = (key: TranslationKey, params?: Record<string, string>): string => {
  const currentTranslations = translations[currentLanguage] as any;
  let text = currentTranslations[key] || translations.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }

  return text;
};

export const useTranslation = () => {
  const [lang, setLang] = useState<LanguageCode>(currentLanguage);

  useEffect(() => {
    const listener = (newLang: LanguageCode) => setLang(newLang);
    listeners.add(listener);
    // Trigger once in case language loaded from storage after mount
    setLang(currentLanguage);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const translate = useCallback((key: TranslationKey, params?: Record<string, string>) => {
    return t(key, params);
  }, [lang]);

  return { t: translate, lang, setLanguage };
};
