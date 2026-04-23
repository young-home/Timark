import type { Todo } from '../../types/todo';
import { useLanguage } from '../../hooks/useLanguage';
import { useEffect } from 'react';
import { TodoItem } from '../TodoItem/TodoItem';
import './TodoList.css';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<Todo>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
  highlightedTodoId: number | null;
  todoItemsRef: React.MutableRefObject<Map<number, HTMLLIElement>>;
}

export function TodoList({ todos, onToggle, onDelete, onUpdate, onReorder, filter, searchQuery, highlightedTodoId, todoItemsRef }: TodoListProps) {
  const { language } = useLanguage();

  // 先按 filter 筛选，再按 searchQuery 搜索
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const searchedTodos = searchQuery
    ? filteredTodos.filter(todo =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTodos;

  // 当 highlightedTodoId 变化时，通知对应的 TodoItem
  useEffect(() => {
    if (highlightedTodoId) {
      const element = document.getElementById(`todo-${highlightedTodoId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [highlightedTodoId]);

  const messages = {
    zh: {
      all: '还没有任务，添加一个开始吧！',
      active: '没有进行中的任务',
      completed: '没有已完成的任务',
      search: '没有找到匹配的任务',
    },
    en: {
      all: 'No tasks yet. Add one to get started!',
      active: 'No active tasks',
      completed: 'No completed tasks',
      search: 'No matching tasks found',
    },
  };

  if (searchedTodos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <p>{searchQuery ? messages[language].search : messages[language][filter]}</p>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {searchedTodos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          index={index}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onReorder={onReorder}
          highlighted={highlightedTodoId === todo.id}
          todoItemsRef={todoItemsRef}
          isHighlightedBySearch={!!searchQuery && todo.text.toLowerCase().includes(searchQuery.toLowerCase())}
        />
      ))}
    </ul>
  );
}
