// 浏览器控制台数据迁移脚本
// 用法：打开浏览器 F12 控制台，复制粘贴这段代码并回车执行
(async function migrateTodos() {
  const stored = localStorage.getItem('todos');
  if (!stored) { console.log('localStorage 中没有待办数据'); return; }
  const todos = JSON.parse(stored);
  if (!Array.isArray(todos) || todos.length === 0) { console.log('localStorage 中没有待办数据'); return; }
  const token = localStorage.getItem('auth_token');
  if (!token) { console.log('未登录，请先登录'); return; }
  console.log(`找到 ${todos.length} 条本地数据，开始迁移...\n`);
  let success = 0, failed = 0;
  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i];
    try {
      const res = await fetch('http://localhost:3001/api/v1/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          text: todo.text,
          priority: todo.priority || 'medium',
          completed: todo.completed || false,
          createdAt: todo.createdAt,
        }),
      });
      if (res.ok) {
        const dateStr = todo.createdAt ? new Date(todo.createdAt).toLocaleDateString() : '今天';
        console.log(`[${i + 1}/${todos.length}] ✓ "${todo.text.substring(0, 40)}" ${todo.completed ? '(已完成)' : ''} ${dateStr}`);
        success++;
      } else {
        const err = await res.json();
        console.log(`[${i + 1}/${todos.length}] ✗ 失败：${err.error}`);
        failed++;
      }
    } catch (e) {
      console.log(`[${i + 1}/${todos.length}] ✗ 网络错误`);
      failed++;
    }
  }
  console.log(`\n${'='.repeat(40)}\n迁移完成！成功：${success}，失败：${failed}\n💡 localStorage 数据已保留，需要清理时告诉我\n${'='.repeat(40)}`);
})();
