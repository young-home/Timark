#!/bin/bash
# 清理占用 5173 端口的进程

# 查找占用 5173 端口的进程 PID
PID=$(netstat -ano | grep ":5173" | grep "LISTENING" | awk '{print $NF}' | head -1)

if [ ! -z "$PID" ]; then
    echo "发现占用 5173 端口的进程: $PID"
    # 使用 PowerShell 终止进程
    powershell.exe -c "Stop-Process -Id $PID -Force"
    echo "已终止进程 $PID"
fi

# 启动开发服务器
npm run dev
