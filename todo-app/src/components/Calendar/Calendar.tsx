import { useState, useEffect } from 'react';
import type { Todo } from '../../types/todo';
import { useLanguage } from '../../hooks/useLanguage';
import './Calendar.css';

interface CalendarProps {
  todos: Todo[];
  onTodoClick?: (todoId: number) => void;
  onMoveToToday?: (todoId: number) => void;
  onMoveAllActiveToToday?: () => void;
  searchQuery?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  todos: Todo[];
}

export function Calendar({ todos, onTodoClick, onMoveToToday, onMoveAllActiveToToday, searchQuery = '' }: CalendarProps) {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const t = {
    zh: {
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      prev: '上月',
      next: '下月',
      noTasks: '无任务',
      moveToToday: '移到今天',
      moveAllActive: '回归当下',
    },
    en: {
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      prev: 'Prev',
      next: 'Next',
      noTasks: 'No tasks',
      moveToToday: 'Move to Today',
      moveAllActive: 'Back to Today',
    },
  };

  const formatTitle = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return language === 'zh' ? `${year}年${month}月` : `${t.en.months[date.getMonth()]} ${year}`;
  };

  const getDaysInMonth = (year: number, month: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];

    // 添加上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        todos: getTodosForDate(date),
      });
    }

    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        todos: getTodosForDate(date),
      });
    }

    // 添加下个月的日期（补齐 42 天 - 6 行）
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        todos: getTodosForDate(date),
      });
    }

    return days;
  };

  const getWeeks = (days: CalendarDay[]): CalendarDay[][] => {
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const getTodosForDate = (date: Date): Todo[] => {
    // 使用本地时间比较，避免时区问题
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const todosForDate = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return (
        todoDate.getFullYear() === year &&
        todoDate.getMonth() === month &&
        todoDate.getDate() === day
      );
    });

    // 如果有搜索查询，进一步过滤
    if (searchQuery) {
      return todosForDate.filter(todo =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return todosForDate;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const weeks = getWeeks(days);

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: string): string => {
    const labels = language === 'zh'
      ? { high: '高', medium: '中', low: '低' }
      : { high: 'HIGH', medium: 'MED', low: 'LOW' };
    return labels[priority as keyof typeof labels] || priority;
  };

  const handleTodoClick = (e: React.MouseEvent, todoId: number) => {
    e.stopPropagation();
    // 触发左侧列表定位
    onTodoClick?.(todoId);
    // 切换弹层显示
    if (selectedTodoId === todoId) {
      setSelectedTodoId(null);
    } else {
      setSelectedTodoId(todoId);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 4,
      });
    }
  };

  const closeTooltip = () => setSelectedTodoId(null);

  // 点击其他地方关闭弹层
  useEffect(() => {
    const handleClickOutside = () => closeTooltip();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="calendar-header-left">
          <button className="calendar-nav" onClick={handlePrevMonth}>
            ‹ {t[language].prev}
          </button>
          <button className="calendar-nav" onClick={handleNextMonth}>
            {t[language].next} ›
          </button>
        </div>
        <h3 className="calendar-title">
          {formatTitle(currentDate)}
        </h3>
        <button
          className="calendar-move-all-btn"
          onClick={() => onMoveAllActiveToToday?.()}
          title={t[language].moveAllActive}
        >
          {t[language].moveAllActive}
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {t[language].weekdays.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-weeks">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                >
                  <div className={`calendar-day-number ${isToday(day.date) ? 'today' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="calendar-day-todos">
                    {day.todos.length === 0 ? (
                      <span className="no-tasks">{t[language].noTasks}</span>
                    ) : (
                      day.todos.map(todo => (
                        <div
                          key={todo.id}
                          className={`calendar-todo-item ${todo.completed ? 'completed' : ''} ${searchQuery && todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 'search-match' : ''}`}
                          onClick={(e) => handleTodoClick(e, todo.id)}
                        >
                          <span
                            className={`todo-priority-dot ${todo.priority}`}
                          />
                          <span className="todo-text">{todo.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {selectedTodoId && (
        <div
          className="calendar-todo-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const todo = todos.find(t => t.id === selectedTodoId);
            if (!todo) return null;
            const createdAt = new Date(todo.createdAt);
            const dateStr = language === 'zh'
              ? `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`
              : createdAt.toLocaleDateString();
            return (
              <>
                <div className="tooltip-text">{todo.text}</div>
                <div className="tooltip-meta">
                  <span className={`tooltip-priority ${todo.priority}`}>{getPriorityLabel(todo.priority)}</span>
                  <span className="tooltip-date">{dateStr}</span>
                </div>
                <button
                  className="tooltip-move-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToToday?.(selectedTodoId);
                    setSelectedTodoId(null);
                  }}
                >
                  {t[language].moveToToday}
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
