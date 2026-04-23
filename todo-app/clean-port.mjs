import { execSync } from 'child_process';

// 清理 5173-5179 范围内的端口
for (let port = 5173; port <= 5179; port++) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    const lines = output.split('\n').filter(line => line.includes('LISTENING'));

    if (lines.length > 0) {
      const pid = lines[0].trim().split(/\s+/).pop();
      if (pid) {
        console.log(`发现占用端口 ${port} 的进程，PID: ${pid}`);
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`已终止进程 ${pid}`);
      }
    }
  } catch (error) {
    // 没有占用
  }
}
