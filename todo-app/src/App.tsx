import { useState, useRef, useEffect } from 'react';
import type { FilterType } from './types/todo';
import { useTodos } from './hooks/useTodos';
import { Header } from './components/Header/Header';
import { InputSection } from './components/InputSection/InputSection';
import { Filters } from './components/Filters/Filters';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
import { Calendar } from './components/Calendar/Calendar';
import './App.css';

function App() {
  const { todos, addTodo, toggleTodo, updateTodo, reorderTodos, deleteTodo, clearCompleted, moveTodoToToday, moveAllActiveToToday } = useTodos();
  const [currentFilter, setCurrentFilter] = useState<FilterType>('active');
  const [highlightedTodoId, setHighlightedTodoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const todoPanelRef = useRef<HTMLDivElement>(null);
  const calendarPanelRef = useRef<HTMLDivElement>(null);
  const todoItemsRef = useRef<Map<number, HTMLLIElement>>(new Map());

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  const handleTodoClick = (todoId: number) => {
    setHighlightedTodoId(todoId);
    setTimeout(() => setHighlightedTodoId(null), 2500);
  };

  const handleMoveToToday = (todoId: number) => {
    moveTodoToToday(todoId);
  };

  const handleMoveAllActiveToToday = () => {
    moveAllActiveToToday();
  };

  useEffect(() => {
    // 同步两个面板的高度
    const syncHeight = () => {
      const todoContainer = todoPanelRef.current?.querySelector('.container');
      if (calendarPanelRef.current && todoContainer) {
        const todoHeight = todoContainer.offsetHeight;
        calendarPanelRef.current.style.height = `${todoHeight}px`;
      }
    };

    // 初始同步
    setTimeout(syncHeight, 0);

    // 使用 ResizeObserver 监听待办面板高度变化
    const observer = new ResizeObserver(syncHeight);
    if (todoPanelRef.current) {
      observer.observe(todoPanelRef.current);
    }

    return () => observer.disconnect();
  }, [todos]);

  return (
    <div className="app-container">
      <div className="todo-panel" ref={todoPanelRef}>
        <div className="container">
          <Header
            total={todos.length}
            active={activeCount}
            completed={completedCount}
            onSearchChange={setSearchQuery}
          />
          <InputSection onAdd={addTodo} />
          <Filters currentFilter={currentFilter} onFilterChange={setCurrentFilter} />
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
            onReorder={reorderTodos}
            filter={currentFilter}
            searchQuery={searchQuery}
            highlightedTodoId={highlightedTodoId}
            todoItemsRef={todoItemsRef}
          />
          <Footer
            activeCount={activeCount}
            totalCount={todos.length}
            onClearCompleted={clearCompleted}
          />
        </div>
      </div>
      <div className="calendar-panel" ref={calendarPanelRef}>
        <Calendar todos={todos} onTodoClick={handleTodoClick} onMoveToToday={handleMoveToToday} onMoveAllActiveToToday={handleMoveAllActiveToToday} searchQuery={searchQuery} />
      </div>
    </div>
  );
}

export default App;
