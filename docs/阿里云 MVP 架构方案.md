# 阿里云 MVP 架构方案

> 基于阿里云服务的多用户待办应用架构设计
> 
> 版本：v1.1  
> 更新日期：2026-04-23

---

## 技术决策记录

### 数据库选型：PostgreSQL

**决策时间**：2026-04-23  
**决策者**：团队讨论  
**原因**：
- JSONB 能力为未来留足扩展空间
- 高并发写性能更好（MVCC）
- 复杂查询能力强（窗口函数、CTE）
- 阿里云 RDS PostgreSQL 已非常成熟

**备选方案**：MySQL（团队更熟悉时可选）

---

### 函数计算运行时：Node.js 18

**决策时间**：2026-04-23  
**决策者**：团队讨论  
**原因**：
- 冷启动更快（~400ms vs Python ~700ms）
- 异步 I/O 天然优势，适合 API 服务
- 前后端技术栈统一（TypeScript）
- JSON 处理原生支持
- 包体积更小，部署更快

**备选方案**：Python 3.10（如果需要 AI/ML 能力）

---

### 前端架构：轻量改造方案

**决策时间**：2026-04-23  
**决策者**：团队讨论  
**原因**：
- 保持简单，只加必要的抽象
- 快速上线，避免过度设计
- 技术债可控，后续可迭代

**改造清单**：
| 项目 | 决策 |
|------|------|
| 路由库 | ✅ react-router-dom |
| API 层 | ✅ 新增 src/api/index.ts |
| 认证 Hook | ✅ 新增 src/hooks/useAuth.ts |
| 状态管理 | ❌ MVP 阶段不用 Zustand/Redux |
| UI 组件库 | ❌ 不用（当前样式已定制） |
| 表单库 | ❌ 不用（表单简单） |

**新增文件**：
- `src/api/index.ts` - API 调用封装
- `src/hooks/useAuth.ts` - 认证 Hook
- `src/pages/Login.tsx` - 登录页
- `src/pages/Register.tsx` - 注册页
- `src/components/ProtectedRoute.tsx` - 路由守卫

**修改文件**：
- `src/main.tsx` - 添加路由配置
- `src/App.tsx` - 简化为纯 UI 组件
- `src/hooks/useTodos.ts` - 改用 API 调用

**备选方案**：Zustand（后续如 props 传递繁琐再考虑）

---

---

## 目录

- [1. 架构概述](#1-架构概述)
- [2. 整体架构图](#2-整体架构图)
- [3. 技术选型](#3-技术选型)
- [4. 数据库设计](#4-数据库设计)
- [5. API 接口设计](#5-api-接口设计)
- [6. 函数计算设计](#6-函数计算设计)
- [7. 前端改造方案](#7-前端改造方案)
- [8. 资源配置与成本](#8-资源配置与成本)
- [9. 实施步骤](#9-实施步骤)

---

## 1. 架构概述

### 1.1 背景

当前应用使用 `localStorage` 存储数据，存在以下限制：
- 仅限单设备访问，无法多设备同步
- 数据存储在本地，存在丢失风险
- 不支持多用户

### 1.2 目标

- [x] 支持用户注册/登录
- [x] 数据云端存储，支持多设备同步
- [x] 利用公司现有阿里云资源
- [x] 架构可支持未来用户增长（高并发扩展）

### 1.3 设计原则

| 原则 | 说明 |
|------|------|
| **Serverless 优先** | 按量付费，自动弹性伸缩 |
| **动静分离** | 静态资源走 CDN，动态请求走 API |
| **安全合规** | JWT 认证，数据加密，国内部署 |
| **成本可控** | 初期利用免费额度，随业务增长扩容 |

---

## 2. 整体架构图

```
                                    用户请求
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
           ┌─────────────────┐                   ┌─────────────────┐
           │   OSS + CDN     │                   │    API 网关      │
           │  (静态资源)      │                   │  (动态 API)      │
           └────────┬────────┘                   └────────┬────────┘
                    │                                     │
                    │                                     ▼
                    │                          ┌─────────────────┐
                    │                          │   函数计算 FC    │
                    │                          │  (后端逻辑)      │
                    │                          └────────┬────────┘
                    │                                   │
                    │              ┌────────────────────┼────────────────────┐
                    │              │                    │                    │
                    │              ▼                    ▼                    ▼
                    │     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐
                    │     │  RDS PostgreSQL │  │   Redis 缓存     │  │    OSS      │
                    │     │   (主数据库)     │  │  (可选，后期)    │  │  (文件存储)  │
                    │     └─────────────────┘  └─────────────────┘  └─────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │   用户浏览器     │
           │  (React 应用)    │
           └─────────────────┘
```

### 2.1 数据流

```
1. 用户访问页面 → OSS CDN 加载静态资源 (HTML/CSS/JS)
2. 前端调用 API → API 网关接收请求
3. 函数计算执行业务逻辑 → RDS 读写数据
4. 返回结果 → 前端更新界面
```

---

## 3. 技术选型

### 3.1 阿里云服务

| 服务 | 用途 | 配置建议 |
|------|------|----------|
| **OSS** | 前端静态资源托管 | 标准存储，开启 CDN |
| **API 网关** | API 入口、鉴权、限流 | 免费版（100 万次/月） |
| **函数计算 FC** | 后端业务逻辑 | Node.js 18，自动弹性 |
| **RDS PostgreSQL** | 主数据库 | 2 核 4G 主从版 |
| **Redis** | 缓存（可选） | 后期根据需求添加 |

### 3.2 技术栈

```
前端：React 19 + TypeScript + Vite
后端：Node.js 18 (函数计算)
数据库：PostgreSQL 14
认证：JWT (jsonwebtoken)
密码加密：bcryptjs
数据库客户端：pg
```

---

## 4. 数据库设计

### 4.1 用户表（users）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | VARCHAR(255) | 邮箱（登录用） |
| password_hash | VARCHAR(255) | bcrypt 加密后的密码 |
| display_name | VARCHAR(100) | 显示名称 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 4.2 待办表（todos）

```sql
CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引（优化查询性能）
CREATE INDEX idx_todos_user_created ON todos(user_id, created_at DESC);
CREATE INDEX idx_todos_user_completed ON todos(user_id, completed);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| user_id | UUID | 外键，关联 users 表 |
| text | TEXT | 待办内容 |
| completed | BOOLEAN | 是否完成 |
| priority | VARCHAR(20) | 优先级：high/medium/low |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 4.3 表关系

```
┌─────────────┐         ┌─────────────┐
│   users     │         │    todos    │
├─────────────┤         ├─────────────┤
│ id (PK)     │◀───────▶│ user_id (FK)│
│ email       │    1:N  │ text        │
│ password    │         │ completed   │
└─────────────┘         └─────────────┘
```

---

## 5. API 接口设计

### 5.1 认证接口

#### POST /api/v1/auth/register

用户注册

**请求**：
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "张三"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "displayName": "张三"
    }
  }
}
```

#### POST /api/v1/auth/login

用户登录

**请求**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**：同注册接口

### 5.2 待办接口

所有待办接口需要在 Header 中携带 Token：
```
Authorization: Bearer <token>
```

#### GET /api/v1/todos

获取待办列表

**查询参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| filter | string | all/active/completed |
| priority | string | high/medium/low |
| search | string | 搜索关键词 |

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "完成项目文档",
      "completed": false,
      "priority": "high",
      "createdAt": "2026-04-23T10:00:00Z"
    }
  ]
}
```

#### POST /api/v1/todos

创建待办

**请求**：
```json
{
  "text": "新任务",
  "priority": "high"
}
```

#### PUT /api/v1/todos/:id

更新待办

**请求**：
```json
{
  "text": "更新后的内容",
  "completed": true,
  "priority": "medium"
}
```

#### DELETE /api/v1/todos/:id

删除待办

**响应**：
```json
{
  "success": true
}
```

---

## 6. 函数计算设计

### 6.1 目录结构

```
functions/
├── common/
│   ├── db.js           # 数据库连接池
│   ├── auth.js         # 认证中间件
│   └── response.js     # 统一响应格式
├── auth/
│   ├── register/
│   │   └── index.js    # 用户注册
│   └── login/
│       └── index.js    # 用户登录
├── todos/
│   ├── list/
│   │   └── index.js    # 获取待办列表
│   ├── create/
│   │   └── index.js    # 创建待办
│   ├── update/
│   │   └── index.js    # 更新待办
│   └── delete/
│       └── index.js    # 删除待办
├── package.json
└── template.yml        # ROS 部署模板
```

### 6.2 核心代码示例

#### 数据库连接池（common/db.js）

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,              // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = { pool };
```

#### 认证中间件（common/auth.js）

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  
  const token = authHeader.substring(7);
  const payload = jwt.verify(token, JWT_SECRET);
  
  return payload.userId;
}

module.exports = { authMiddleware };
```

#### 统一响应格式（common/response.js）

```javascript
function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ success: true, data }),
  };
}

function error(message, statusCode = 400) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ success: false, error: message }),
  };
}

module.exports = { success, error };
```

#### 用户注册（auth/register/index.js）

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../common/db');
const { success, error } = require('../../common/response');

const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = async (event, context) => {
  try {
    const { email, password, displayName } = JSON.parse(event.body);
    
    // 检查邮箱是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return error('邮箱已被注册', 409);
    }
    
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建用户
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, display_name, created_at`,
      [email, passwordHash, displayName]
    );
    
    const user = result.rows[0];
    
    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return success({ token, user }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return error(err.message, 500);
  }
};
```

---

## 7. 前端改造方案

### 7.1 新增文件

```
src/
├── api/
│   └── index.ts        # API 调用封装
├── hooks/
│   └── useAuth.ts      # 认证 Hook
└── pages/
    ├── Login.tsx       # 登录页
    └── Register.tsx    # 注册页
```

### 7.2 API 调用封装（src/api/index.ts）

```typescript
const API_BASE_URL = 'https://your-api-gateway.aliyuncs.com/api/v1';

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
```

### 7.3 认证 Hook（src/hooks/useAuth.ts）

```typescript
import { useState, useEffect } from 'react';
import { authApi } from '../api';

interface User {
  id: string;
  email: string;
  displayName: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // 解析 JWT 获取用户信息
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.userId,
          email: payload.email,
          displayName: payload.displayName,
        });
      } catch {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email: string, password: string, displayName: string) => {
    const data = await authApi.register(email, password, displayName);
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
```

### 7.4 改造 useTodos（src/hooks/useTodos.ts）

```typescript
import { useState, useEffect } from 'react';
import { todosApi } from '../api';
import type { Todo, PriorityType, FilterType } from '../types/todo';

export function useTodos(filter: FilterType = 'active', searchQuery?: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, [filter, searchQuery]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const filterParam = filter === 'active' ? 'active' : filter === 'completed' ? 'completed' : undefined;
      const data = await todosApi.list(filterParam, undefined, searchQuery);
      setTodos(data);
    } catch (err) {
      console.error('Failed to load todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (text: string, priority: PriorityType = 'medium') => {
    const newTodo = await todosApi.create(text, priority);
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await todosApi.update(id, { completed: !todo.completed });
      setTodos(prev =>
        prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      );
    }
  };

  const deleteTodo = async (id: number) => {
    await todosApi.delete(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // ... 其他方法类似改造

  return { 
    todos, 
    loading,
    addTodo, 
    toggleTodo, 
    deleteTodo,
    // ... 其他方法
  };
}
```

---

## 8. 资源配置与成本

### 8.1 阿里云服务配置

| 服务 | 配置 | 价格（约） |
|------|------|----------|
| **RDS PostgreSQL** | 2 核 4G 主从版，SSP 云盘 | 350 元/月 |
| **函数计算 FC** | 按量付费 | 免费额度：100 万 GB 秒/月 |
| **API 网关** | 免费版 | 免费：100 万次调用/月 |
| **OSS** | 标准存储，50GB | 存储：6 元/月 + 流量：按量 |
| **CDN** | 按流量计费 | 0.24 元/GB |

### 8.2 初期成本估算（< 1000 DAU）

| 服务 | 月成本 |
|------|--------|
| RDS PostgreSQL | 350 元 |
| 函数计算 | 0 元（免费额度内） |
| API 网关 | 0 元（免费版） |
| OSS + CDN | 约 20 元 |
| **合计** | **约 370 元/月** |

### 8.3 扩展成本（10000 DAU）

| 服务 | 月成本 |
|------|--------|
| RDS PostgreSQL（4 核 8G） | 800 元 |
| 函数计算 | 约 200 元 |
| API 网关 | 0 元 |
| OSS + CDN | 约 200 元 |
| Redis（可选） | 200 元 |
| **合计** | **约 1400 元/月** |

---

## 9. 实施步骤

### 阶段一：环境准备（1-2 天）

1. [ ] 开通阿里云服务
   - RDS PostgreSQL 实例
   - 函数计算 FC
   - API 网关
   - OSS Bucket

2. [ ] 数据库初始化
   - 执行建表 SQL
   - 创建数据库用户

3. [ ] 配置环境变量
   - 在函数计算中设置 DB_* 环境变量
   - 设置 JWT_SECRET

### 阶段二：后端开发（2-3 天）

4. [ ] 编写函数计算代码
   - 认证接口（register/login）
   - 待办 CRUD 接口

5. [ ] 部署函数计算
   - 使用 funcraft 或 ROS 模板部署
   - 配置 API 网关路由

6. [ ] 测试 API
   - 使用 Postman 测试各接口

### 阶段三：前端改造（3-4 天）

7. [ ] 新增 API 调用层

8. [ ] 新增认证功能
   - 登录/注册页面
   - useAuth Hook

9. [ ] 改造 useTodos
   - 从 localStorage 改为 API 调用

10. [ ] 添加路由
    - 未登录跳转登录页

### 阶段四：部署测试（1-2 天）

11. [ ] 前端部署到 OSS
    - 构建打包
    - 上传到 OSS
    - 配置 CDN

12. [ ] 联调测试
    - 完整流程测试
    - 多设备同步测试

13. [ ] 性能优化
    - 数据库索引优化
    - CDN 缓存配置

---

## 附录

### A. 环境变量列表

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DB_HOST | RDS 连接地址 | pg-xxx.rds.aliyuncs.com |
| DB_PORT | 数据库端口 | 5432 |
| DB_NAME | 数据库名 | todo_db |
| DB_USER | 数据库用户 | todo_admin |
| DB_PASSWORD | 数据库密码 | xxxxx |
| JWT_SECRET | JWT 密钥 | your-secret-key-32chars |

### B. 依赖包列表

**函数计算（package.json）**：
```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}
```

**前端新增依赖**：
```bash
npm install jwt-decode
```

### C. 参考资料

- [阿里云函数计算文档](https://help.aliyun.com/product/2512677.html)
- [阿里云 API 网关文档](https://help.aliyun.com/product/44258.html)
- [阿里云 RDS PostgreSQL 文档](https://help.aliyun.com/product/26088.html)
- [Serverless 应用中心](https://www.serverless.com/)
