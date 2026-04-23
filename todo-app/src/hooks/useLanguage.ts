import { useState, useEffect } from 'react';
import type { Language } from '../locales';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored === 'zh' || stored === 'en') ? stored : 'zh';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return { language, setLanguage, toggleLanguage };
}
