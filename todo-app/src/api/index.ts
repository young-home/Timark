// 根据环境切换 API 地址
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api/v1'  // 本地开发
  : 'https://your-api-gateway.aliyuncs.com/api/v1';  // 生产环境

// 获取存储的 token
function getToken(): string | null {
  return localStorage.getItem('auth_token');
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
