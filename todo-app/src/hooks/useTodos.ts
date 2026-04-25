import { useState, useEffect, useCallback } from 'react';
import type { Todo, PriorityType } from '../types/todo';
import { todosApi, mapDBTodoToTodo } from '../api';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载待办列表
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dbTodos = await todosApi.list();
      const mapped: Todo[] = (Array.isArray(dbTodos) ? dbTodos : []).map(mapDBTodoToTodo);
      setTodos(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const addTodo = async (text: string, priority: PriorityType = 'medium') => {
    try {
      setError(null);
      const dbTodo = await todosApi.create(text.trim(), priority);
      const newTodo = mapDBTodoToTodo(dbTodo as Record<string, unknown>);
      setTodos(prev => [newTodo, ...prev]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建失败');
    }
  };

  const reorderTodos = (fromIndex: number, toIndex: number) => {
    setTodos(prev => {
      const newTodos = [...prev];
      const [removed] = newTodos.splice(fromIndex, 1);
      newTodos.splice(toIndex, 0, removed);
      return newTodos.map((todo, index) => ({ ...todo, order: index }));
    });
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      setError(null);
      const updated = await todosApi.update(id, { completed: !todo.completed });
      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, completed: (updated as Record<string, unknown>).completed as boolean } : t
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      setError(null);
      await todosApi.delete(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    try {
      setError(null);
      const apiUpdates: Record<string, unknown> = {};
      if (updates.text !== undefined) apiUpdates.text = updates.text;
      if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
      if (updates.completed !== undefined) apiUpdates.completed = updates.completed;

      const updated = await todosApi.update(id, apiUpdates);
      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, ...updates, createdAt: (updated as Record<string, unknown>).created_at as string || t.createdAt } : t
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed);
    if (completedTodos.length === 0) return;
    try {
      setError(null);
      await Promise.all(
        completedTodos.map(t => todosApi.delete(t.id))
      );
      setTodos(prev => prev.filter(t => !t.completed));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '清除失败');
    }
  };

  const moveTodoToToday = async (id: number) => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const updated = await todosApi.update(id, { completed: false, createdAt: now });
      setTodos(prev =>
        prev.map(t =>
          t.id === id
            ? { ...t, completed: false, createdAt: now }
            : t
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const moveAllActiveToToday = async () => {
    const activeTodos = todos.filter(t => !t.completed);
    if (activeTodos.length === 0) return;
    try {
      setError(null);
      const now = new Date().toISOString();
      await Promise.all(
        activeTodos.map(t => todosApi.update(t.id, { createdAt: now }))
      );
      setTodos(prev =>
        prev.map(t =>
          !t.completed
            ? { ...t, createdAt: now }
            : t
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    reorderTodos,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    moveTodoToToday,
    moveAllActiveToToday,
  };
}
