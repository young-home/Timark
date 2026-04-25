import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import './Header.css';

interface HeaderProps {
  total: number;
  active: number;
  completed: number;
  onSearchExpand?: (isExpanded: boolean) => void;
  onSearchChange?: (query: string) => void;
  userDisplayName?: string;
  onLogout?: () => void;
}

export function Header({ total, active, completed, onSearchExpand, onSearchChange, userDisplayName, onLogout }: HeaderProps) {
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
      logout: '退出登录',
    },
    en: {
      title: 'TASKS',
      subtitle: 'Manage your daily tasks',
      stats: { total: 'Total', active: 'Active', done: 'Done' },
      searchPlaceholder: 'Search tasks...',
      logout: 'Logout',
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
    if (!e.target.value) {
      setIsSearchExpanded(false);
      onSearchExpand?.(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSearchExpanded && e.key === 'Escape') {
        setIsSearchExpanded(false);
        onSearchExpand?.(false);
        return;
      }

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

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchExpanded]);

  return (
    <div className="header">
      <div className={`header-title-wrapper ${isSearchExpanded ? 'hidden' : ''}`}>
        <h1>{t[language].title}</h1>
        <p>{t[language].subtitle}</p>
      </div>
      {!isSearchExpanded && (
        <div className="header-actions">
          {userDisplayName && (
            <span className="user-display-name">{userDisplayName}</span>
          )}
          <button className="search-toggle-btn" onClick={handleToggleSearch}>
            <span className="search-icon">🔍</span>
          </button>
          {onLogout && (
            <button className="logout-btn" onClick={onLogout} title={t[language].logout}>
              {language === 'zh' ? '退出' : 'Logout'}
            </button>
          )}
        </div>
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
