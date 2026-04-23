import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import './Header.css';

interface HeaderProps {
  total: number;
  active: number;
  completed: number;
  onSearchExpand?: (isExpanded: boolean) => void;
  onSearchChange?: (query: string) => void;
}

export function Header({ total, active, completed, onSearchExpand, onSearchChange }: HeaderProps) {
  const { language } = useLanguage();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const t = {
    zh: {
      title: '待办事项',
      subtitle: '管理你的日常任务',
      stats: { total: '总任务', active: '进行中', done: '已完成' },
      searchPlaceholder: '搜索任务...',
    },
    en: {
      title: 'TASKS',
      subtitle: 'Manage your daily tasks',
      stats: { total: 'Total', active: 'Active', done: 'Done' },
      searchPlaceholder: 'Search tasks...',
    },
  };

  const handleToggleSearch = () => {
    if (isSearchExpanded) {
      if (searchQuery) {
        setSearchQuery('');
        onSearchChange?.('');
      }
      setIsSearchExpanded(false);
      onSearchExpand?.(false);
    } else {
      setIsSearchExpanded(true);
      onSearchExpand?.(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearchChange?.('');
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 使用 e.target.value 获取最新的输入值
    if (!e.target.value) {
      setIsSearchExpanded(false);
      onSearchExpand?.(false);
    }
  };

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在输入框中，按 Esc 折叠搜索框
      if (isSearchExpanded && e.key === 'Escape') {
        setIsSearchExpanded(false);
        onSearchExpand?.(false);
        return;
      }

      // 如果焦点不在输入框，按 S 展开搜索框
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (!isInputFocused && e.key === 's' && !isSearchExpanded) {
        e.preventDefault();
        setIsSearchExpanded(true);
        onSearchExpand?.(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchExpanded, onSearchExpand]);

  // 搜索框展开时自动聚焦
  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchExpanded]);

  return (
    <div className="header">
      {/* 占位元素，保持高度一致 */}
      <div className={`header-title-wrapper ${isSearchExpanded ? 'hidden' : ''}`}>
        <h1>{t[language].title}</h1>
        <p>{t[language].subtitle}</p>
      </div>
      {!isSearchExpanded && (
        <button className="search-toggle-btn" onClick={handleToggleSearch}>
          <span className="search-icon">🔍</span>
        </button>
      )}
      {isSearchExpanded && (
        <div className="header-search-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="header-search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t[language].searchPlaceholder}
            onBlur={handleSearchBlur}
          />
          {searchQuery && (
            <button className="header-search-clear" onClick={handleClearSearch} onMouseDown={(e) => e.preventDefault()}>
              ×
            </button>
          )}
        </div>
      )}
      <div className="stats">
        <div className="stat">
          <div className="stat-number">{total}</div>
          <div className="stat-label">{t[language].stats.total}</div>
        </div>
        <div className="stat">
          <div className="stat-number active">{active}</div>
          <div className="stat-label">{t[language].stats.active}</div>
        </div>
        <div className="stat">
          <div className="stat-number done">{completed}</div>
          <div className="stat-label">{t[language].stats.done}</div>
        </div>
      </div>
    </div>
  );
}
