import { useState, useEffect } from 'react';
import { todosApi, mapDBTodoToTodo } from '../api';
import type { Todo } from '../types/todo';
import './MigrationBanner.css';

interface MigrationBannerProps {
  onComplete: () => void;
}

export default function MigrationBanner({ onComplete }: MigrationBannerProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('正在迁移...');
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const migrate = async () => {
      const stored = localStorage.getItem('todos');
      if (!stored) {
        onComplete();
        return;
      }

      let oldTodos: Todo[];
      try {
        oldTodos = JSON.parse(stored);
      } catch {
        onComplete();
        return;
      }

      if (!Array.isArray(oldTodos) || oldTodos.length === 0) {
        onComplete();
        return;
      }

      setTotal(oldTodos.length);

      let successCount = 0;
      for (let i = 0; i < oldTodos.length; i++) {
        const todo = oldTodos[i];
        setStatus(`正在迁移第 ${i + 1}/${oldTodos.length} 项...`);
        try {
          await todosApi.create(todo.text, todo.priority || 'medium');
          successCount++;
        } catch {
          // 跳过失败的项，继续迁移下一项
        }
        setCurrent(i + 1);
        setProgress(Math.round(((i + 1) / oldTodos.length) * 100));
      }

      // 迁移完成，清除旧数据
      localStorage.removeItem('todos');
      setStatus(`迁移完成！成功迁移 ${successCount}/${oldTodos.length} 项`);

      // 延迟 1 秒后跳转
      setTimeout(onComplete, 1000);
    };

    migrate();
  }, [onComplete]);

  return (
    <div className="migration-banner">
      <div className="migration-header">
        <h3>数据迁移</h3>
        <p>正在将本地数据迁移到云端</p>
      </div>
      <div className="migration-progress-bar">
        <div
          className="migration-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="migration-status">
        <span>{status}</span>
        <span className="migration-count">
          {current}/{total}
        </span>
      </div>
    </div>
  );
}
