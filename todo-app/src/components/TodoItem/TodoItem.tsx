import { useState, useEffect } from 'react';
import type { Todo, PriorityType } from '../../types/todo';
import type { KeyboardEvent, ChangeEvent, DragEvent } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  index: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<Todo>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  highlighted: boolean;
  todoItemsRef: React.MutableRefObject<Map<number, HTMLLIElement>>;
  isHighlightedBySearch?: boolean;
}

export function TodoItem({ todo, index, onToggle, onDelete, onUpdate, onReorder, highlighted, todoItemsRef, isHighlightedBySearch }: TodoItemProps) {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState<PriorityType>(todo.priority);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setEditText(todo.text);
    setEditPriority(todo.priority);
  }, [todo.text, todo.priority]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText.trim(), priority: editPriority });
    } else {
      setEditText(todo.text);
      setEditPriority(todo.priority);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handlePriorityKeyDown = (e: KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEditPriority(e.target.value as PriorityType);
  };

  // 拖拽处理
  const handleDragStart = (e: DragEvent<HTMLLIElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex !== index) {
      onReorder(fromIndex, index);
    }
    setIsDragging(false);
  };

  return (
    <li
      id={`todo-${todo.id}`}
      className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${isDragging ? 'dragging' : ''} ${highlighted ? 'highlighted' : ''} ${isHighlightedBySearch ? 'search-match' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={(el) => {
        if (el) {
          todoItemsRef.current.set(todo.id, el);
        } else {
          todoItemsRef.current.delete(todo.id);
        }
      }}
    >
      <div className="drag-handle" title="Drag to reorder">⋮⋮</div>
      <div className="checkbox" onClick={() => onToggle(todo.id)}></div>

      {isEditing ? (
        <>
          <input
            type="text"
            className="edit-input"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <select
            className="edit-priority"
            value={editPriority}
            onChange={handlePriorityChange}
            onKeyDown={handlePriorityKeyDown}
          >
            <option value="high">{language === 'zh' ? '高' : 'HIGH'}</option>
            <option value="medium">{language === 'zh' ? '中' : 'MED'}</option>
            <option value="low">{language === 'zh' ? '低' : 'LOW'}</option>
          </select>
        </>
      ) : (
        <span className="todo-text" onDoubleClick={handleDoubleClick}>
          {todo.text}
        </span>
      )}

      <div className="action-buttons">
        {isEditing ? (
          <>
            <button className="action-btn save-btn" onClick={handleSave} title="Save">
              ✓
            </button>
            <button className="action-btn cancel-btn" onClick={handleCancel} title="Cancel">
              ✕
            </button>
          </>
        ) : (
          <button className="delete-btn" onClick={() => onDelete(todo.id)}>×</button>
        )}
      </div>
    </li>
  );
}
