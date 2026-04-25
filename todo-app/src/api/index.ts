import type { Todo } from '../types/todo';

// 根据环境切换 API 地址
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api/v1'
  : 'https://your-api-gateway.aliyuncs.com/api/v1';

// 获取存储的 token
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

// 清除 token（用于 401 响应）
function clearAuth(): void {
  localStorage.removeItem('auth_token');
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

// DB 待办 → 前端 Todo 映射
export function mapDBTodoToTodo(dbTodo: Record<string, unknown>): Todo {
  return {
    id: Number(dbTodo.id),
    text: dbTodo.text as string,
    completed: dbTodo.completed as boolean,
    createdAt: (dbTodo.created_at as string) || new Date().toISOString(),
    priority: (dbTodo.priority as 'high' | 'medium' | 'low') || 'medium',
    order: Date.now() + Math.random(),
  };
}

// 获取本地日期的 ISO 字符串（用于创建任务时按本地日期分组）
export function getLocalDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// 通用请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // 401 → token 过期或无效，自动登出
  if (response.status === 401) {
    clearAuth();
    throw new Error('认证已过期，请重新登录');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data.data;
}

// API 方法
export const authApi = {
  register: (email: string, password: string, displayName: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),

  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => {
    localStorage.removeItem('auth_token');
  },
};

export const todosApi = {
  list: (filter?: string, priority?: string, search?: string) => {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (priority) params.append('priority', priority);
    if (search) params.append('search', search);
    return request(`/todos?${params.toString()}`);
  },

  create: (text: string, priority: string) =>
    request('/todos', {
      method: 'POST',
      body: JSON.stringify({ text, priority }),
    }),

  update: (id: number, updates: Record<string, unknown>) =>
    request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  delete: (id: number) =>
    request(`/todos/${id}`, {
      method: 'DELETE',
    }),
};
