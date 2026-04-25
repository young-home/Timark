---
name: 阿里云 MVP 架构实现计划
description: 使用阿里云服务（OSS+API 网关 + 函数计算+RDS）实现多用户云端待办应用
type: project
---

# 阿里云 MVP 架构实现计划

## Context

**背景**：
- 当前应用使用 localStorage，仅限单设备使用
- 需要支持多用户、多设备同步
- 公司已有阿里云资源，选择阿里云作为云平台

**目标**：
- 实现用户注册/登录功能
- 待办数据云端存储，支持多设备同步
- 保持现有前端交互体验
- 架构可支持未来用户增长

---

## 数据库设计（RDS PostgreSQL）

在阿里云 RDS 中执行以下 SQL：

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 待办表
CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_todos_user_created ON todos(user_id, created_at DESC);
CREATE INDEX idx_todos_user_completed ON todos(user_id, completed);
```

---

## API 接口设计

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/v1/auth/register | 用户注册 | ❌ |
| POST | /api/v1/auth/login | 用户登录 | ❌ |
| GET | /api/v1/todos | 获取待办列表 | ✅ |
| POST | /api/v1/todos | 创建待办 | ✅ |
| PUT | /api/v1/todos/:id | 更新待办 | ✅ |
| DELETE | /api/v1/todos/:id | 删除待办 | ✅ |

---

## 函数计算 FC 代码结构

```
functions/
├── auth/
│   ├── login/index.js
│   └── register/index.js
├── todos/
│   ├── list/index.js
│   ├── create/index.js
│   ├── update/index.js
│   └── delete/index.js
└── package.json
```

**依赖**：`pg` (PostgreSQL), `bcryptjs` (密码加密), `jsonwebtoken` (JWT)

---

## 前端改造

**新增文件**：
- `src/api/index.ts` - API 调用封装
- `src/hooks/useAuth.ts` - 认证 Hook
- `src/pages/Login.tsx`, `src/pages/Register.tsx`

**修改文件**：
- `src/hooks/useTodos.ts` - 改用 API 调用
- `src/App.tsx` - 添加认证逻辑

---

## 阿里云资源配置

| 服务 | 配置 | 说明 |
|------|------|------|
| RDS PostgreSQL | 2 核 4G 主从版 | 约 350 元/月 |
| 函数计算 FC | Node.js 18 | 免费额度内免费 |
| API 网关 | 免费版 | 100 万次调用/月 |
| OSS | 标准存储 | 前端托管 + CDN |

---

## 验证步骤

1. RDS 中建表（DMS 控制台）
2. 部署函数计算代码
3. 配置 API 网关路由
4. Postman 测试 API
5. 前端联调
6. 多设备同步测试
