# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 React + TypeScript + Vite 的待办事项应用。

## 开发命令

```bash
npm run dev      # 启动开发服务器（自动清理占用端口的进程）
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

## 项目结构

```
todo-app/
├── src/
│   ├── components/     # React 组件
│   │   ├── Header/     # 头部（标题 + 统计）
│   │   ├── InputSection/  # 输入区域（含优先级选择）
│   │   ├── Filters/    # 筛选器
│   │   ├── TodoList/   # 待办列表
│   │   ├── TodoItem/   # 待办项（含优先级徽章）
│   │   └── Footer/     # 底部（清除已完成）
│   ├── hooks/          # 自定义 Hooks
│   │   └── useTodos.ts # 待办状态管理
│   ├── types/          # TypeScript 类型
│   │   └── todo.ts     # Todo 接口
│   ├── App.tsx         # 主组件
│   └── App.css         # 全局样式
├── clean-port.mjs      # 端口清理脚本
└── vite.config.ts      # Vite 配置（固定端口 5173）
```

## 功能特性

- 添加/删除/完成任务
- 优先级管理（高/中/低，颜色标识）
- 按状态筛选（全部/进行中/已完成）
- 清除已完成任务
- localStorage 持久化
- 实时统计

## 技术细节

- **固定端口**：开发服务器固定使用 5173 端口
- **自动清理**：`npm run dev` 会自动终止占用端口的旧进程
- **优先级颜色**：高（红）、中（橙）、低（绿）
