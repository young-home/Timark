import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 所有待办接口都需要认证
router.use(authMiddleware);

// 获取待办列表
router.get('/', async (req, res) => {
  try {
    const { filter, priority, search } = req.query;
    const userId = req.userId;

    let query = 'SELECT * FROM todos WHERE user_id = $1';
    const values = [userId];
    let paramIndex = 2;

    // 按状态筛选
    if (filter === 'active') {
      query += ' AND completed = false';
    } else if (filter === 'completed') {
      query += ' AND completed = true';
    }

    // 按优先级筛选
    if (priority && ['high', 'medium', 'low'].includes(priority)) {
      query += ` AND priority = $${paramIndex}`;
      values.push(priority);
      paramIndex++;
    }

    // 搜索
    if (search) {
      query += ` AND text ILIKE $${paramIndex}`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    // 按创建时间倒序
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('获取待办列表错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建待办
router.post('/', async (req, res) => {
  try {
    const { text, priority } = req.body;
    const userId = req.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: '任务内容不能为空' });
    }

    const result = await pool.query(
      `INSERT INTO todos (user_id, text, priority)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, text.trim(), priority || 'medium']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('创建待办错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新待办
router.put('/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const userId = req.userId;
    const { text, completed, priority } = req.body;

    // 先检查权限（只能操作自己的待办）
    const checkResult = await pool.query(
      'SELECT id FROM todos WHERE id = $1 AND user_id = $2',
      [todoId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: '待办不存在或无权操作' });
    }

    // 构建更新字段
    const updates = [];
    const values = [todoId, userId];
    let paramIndex = 3;

    if (text !== undefined) {
      updates.push(`text = $${paramIndex}`);
      values.push(text.trim());
      paramIndex++;
    }

    if (completed !== undefined) {
      updates.push(`completed = $${paramIndex}`);
      values.push(completed);
      paramIndex++;
    }

    if (priority !== undefined && ['high', 'medium', 'low'].includes(priority)) {
      updates.push(`priority = $${paramIndex}`);
      values.push(priority);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '没有提供任何更新' });
    }

    updates.push(`updated_at = NOW()`);

    const result = await pool.query(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('更新待办错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除待办
router.delete('/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const userId = req.userId;

    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '待办不存在或无权操作' });
    }

    res.json({
      success: true,
      data: { id: todoId }
    });
  } catch (err) {
    console.error('删除待办错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
