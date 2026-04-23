import { useState } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import type { PriorityType } from '../../types/todo';
import { useLanguage } from '../../hooks/useLanguage';
import './InputSection.css';

interface InputSectionProps {
  onAdd: (text: string, priority: PriorityType) => void;
}

export function InputSection({ onAdd }: InputSectionProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const { language } = useLanguage();

  const t = {
    zh: {
      placeholder: '添加新任务...',
      add: '添加',
      priority: { high: '高', medium: '中', low: '低' },
    },
    en: {
      placeholder: 'Add new task...',
      add: 'Add',
      priority: { high: 'HIGH', medium: 'MED', low: 'LOW' },
    },
  };

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text.trim(), priority);
      setText('');
      setPriority('medium');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as PriorityType);
  };

  return (
    <div className="input-section">
      <div className="input-wrapper">
        <input
          type="text"
          className="todo-input"
          placeholder={t[language].placeholder}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <select
          className="priority-select"
          value={priority}
          onChange={handlePriorityChange}
        >
          <option value="high">{t[language].priority.high}</option>
          <option value="medium">{t[language].priority.medium}</option>
          <option value="low">{t[language].priority.low}</option>
        </select>
        <button className="add-btn" onClick={handleAdd}>
          {t[language].add}
        </button>
      </div>
    </div>
  );
}
