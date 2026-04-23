import { useState, useEffect } from 'react';
import type { Todo, PriorityType } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const stored = localStorage.getItem('todos');
    if (stored) {
      const parsed = JSON.parse(stored);
      // 按创建时间倒序排列（越晚创建的越在前）
      return parsed.sort((a: Todo, b: Todo) => {
        // 先按 order 字段排序（拖拽后的顺序）
        if (a.order !== b.order) {
          return b.order - a.order;
        }
        // order 相同时，按创建时间倒序
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, priority: PriorityType = 'medium') => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      priority,
      order: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const reorderTodos = (fromIndex: number, toIndex: number) => {
    setTodos(prev => {
      const newTodos = [...prev];
      const [removed] = newTodos.splice(fromIndex, 1);
      newTodos.splice(toIndex, 0, removed);
      // 更新 order 值
      return newTodos.map((todo, index) => ({ ...todo, order: index }));
    });
  };

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const updateTodo = (id: number, updates: Partial<Todo>) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const moveTodoToToday = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, createdAt: new Date().toISOString() }
          : todo
      )
    );
  };

  const moveAllActiveToToday = () => {
    setTodos(prev =>
      prev.map(todo =>
        !todo.completed
          ? { ...todo, createdAt: new Date().toISOString() }
          : todo
      )
    );
  };

  return { todos, addTodo, reorderTodos, toggleTodo, updateTodo, deleteTodo, clearCompleted, moveTodoToToday, moveAllActiveToToday };
}
