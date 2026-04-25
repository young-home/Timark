import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import { pool } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/todos', todoRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('未处理的错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║              本地后端服务已启动                         ║
╠────────────────────────────────────────────────────────╣
║  地址：http://localhost:${PORT}                          ║
║  API:  http://localhost:${PORT}/api/v1                 ║
║  健康：http://localhost:${PORT}/health                 ║
╚════════════════════════════════════════════════════════╝
  `);
});
