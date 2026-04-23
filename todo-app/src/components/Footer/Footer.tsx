import { useLanguage } from '../../hooks/useLanguage';
import './Footer.css';

interface FooterProps {
  activeCount: number;
  totalCount: number;
  onClearCompleted: () => void;
}

export function Footer({ activeCount, totalCount, onClearCompleted }: FooterProps) {
  const { language } = useLanguage();

  const t = {
    zh: { noTasks: '暂无任务', activeCount: '个进行中任务', clear: '清除已完成' },
    en: { noTasks: 'No tasks', activeCount: ' active', clear: 'Clear Done' },
  };

  return (
    <div className="footer">
      <span className="footer-info">
        {totalCount === 0 ? t[language].noTasks : `${activeCount}${t[language].activeCount}`}
      </span>
      <button className="clear-completed" onClick={onClearCompleted}>
        {t[language].clear}
      </button>
    </div>
  );
}
