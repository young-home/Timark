import { useLanguage } from '../../hooks/useLanguage';
import './LanguageToggle.css';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button className="language-toggle" onClick={toggleLanguage}>
      <span className="lang-icon">🌐</span>
      <span className="lang-label">{language === 'zh' ? '中文' : 'EN'}</span>
    </button>
  );
}
