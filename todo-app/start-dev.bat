@echo off
REM 清理占用 5173 端口的进程并启动开发服务器

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo 发现占用 5173 端口的进程：%%a
    taskkill /F /PID %%a 2>nul
    echo 已终止进程 %%a
)

REM 启动开发服务器
npm run dev
