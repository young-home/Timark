// 手动数据迁移脚本
// 用法：node migrate-local-to-db.js

import 'dotenv/config';
import { Pool } from 'pg';
import { readFileSync } from 'fs';

// 从环境变量读取数据库连接信息
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'timark_todo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

// 用户 token（从浏览器 localStorage 中复制）
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log('\n用法：node migrate-local-to-db.js <your_token>');
  console.log('\n如何获取 token：');
  console.log('1. 打开浏览器开发者工具 (F12)');
  console.log('2. Application → Local Storage → http://localhost:5173');
  console.log('3. 复制 auth_token 的值');
  console.log('\n示例：node migrate-local-to-db.js eyJhbGciOi...');
  process.exit(1);
}

async function migrate() {
  // 读取 localStorage 中的旧数据
  let oldTodos;
  try {
    const localData = readFileSync('local-data.json', 'utf-8');
    oldTodos = JSON.parse(localData);
  } catch {
    console.log('未找到 local-data.json 文件');
    console.log('请先在浏览器控制台中运行：');
    console.log('copy(localStorage.getItem("todos"))');
    console.log('然后将内容保存到 local-data.json 文件中');
    return;
  }

  if (!Array.isArray(oldTodos) || oldTodos.length === 0) {
    console.log('localStorage 中没有待办数据，无需迁移');
    return;
  }

  console.log(`\n找到 ${oldTodos.length} 条本地数据，开始迁移...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < oldTodos.length; i++) {
    const todo = oldTodos[i];
    const text = todo.text || '';
    const priority = todo.priority || 'medium';
    const completed = todo.completed || false;

    try {
      // 验证 token 获取用户 ID
      const response = await fetch('http://localhost:3001/api/v1/todos', {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.log('❌ Token 无效或已过期，请重新获取');
        return;
      }

      // 插入待办
      const insertResult = await pool.query(
        `INSERT INTO todos (user_id, text, completed, priority)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          // 从 token 中提取 userId
          JSON.parse(Buffer.from(TOKEN.split('.')[1], 'base64').toString()).userId,
          text,
          completed,
          priority,
        ]
      );

      const dbId = insertResult.rows[0].id;
      console.log(`[${i + 1}/${oldTodos.length}] ✓ "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}" → DB ID: ${dbId}`);
      success++;
    } catch (err) {
      console.log(`[${i + 1}/${oldTodos.length}] ✗ 失败: "${text.substring(0, 30)}..." - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`迁移完成！`);
  console.log(`  成功: ${success} 条`);
  console.log(`  失败: ${failed} 条`);
  console.log(`  总计: ${oldTodos.length} 条`);
  console.log(`${'─'.repeat(50)}\n`);

  if (failed === 0) {
    console.log('✅ 所有数据迁移成功！');
    console.log('💡 你可以在确认后手动清理 localStorage：');
    console.log('   浏览器控制台运行：localStorage.removeItem("todos")');
  }

  await pool.end();
}

migrate().catch(err => {
  console.error('迁移失败:', err);
  pool.end();
  process.exit(1);
});
