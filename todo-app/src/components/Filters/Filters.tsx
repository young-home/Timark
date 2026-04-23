import type { FilterType } from '../../types/todo';
import { useLanguage } from '../../hooks/useLanguage';
import './Filters.css';

interface FiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function Filters({ currentFilter, onFilterChange }: FiltersProps) {
  const { language } = useLanguage();

  const labels = {
    zh: { all: '全部', active: '进行中', completed: '已完成' },
    en: { all: 'ALL', active: 'ACTIVE', completed: 'DONE' },
  };

  const filters: FilterType[] = ['all', 'active', 'completed'];

  return (
    <div className="filters">
      {filters.map(filter => (
        <button
          key={filter}
          className={`filter-btn ${currentFilter === filter ? 'active' : ''}`}
          onClick={() => onFilterChange(filter)}
        >
          {labels[language][filter]}
        </button>
      ))}
    </div>
  );
}
