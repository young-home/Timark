# WSL 和 Docker 迁移到 D 盘指南

> 将 WSL 2 和 Docker Desktop 数据从 C 盘迁移到 D 盘
> 
> 版本：v1.0  
> 更新日期：2026-04-25

---

## 迁移状态

| 组件 | 状态 | 说明 |
|------|------|------|
| **WSL Ubuntu** | ✅ 已迁移 | 已移动到 `D:\WSL\Ubuntu` |
| **Docker Desktop** | ⚠️ 需手动配置 | 见下方步骤 |

---

## WSL Ubuntu 迁移（已完成）

Ubuntu 已成功迁移到 D 盘，位置：`D:\WSL\Ubuntu`

**验证命令**：
```bash
wsl --list --verbose
```

---

## Docker Desktop 迁移方案

### 方案一：通过 Docker Desktop 设置（推荐）

1. **打开 Docker Desktop**
   - 点击任务栏 Docker 图标
   - 或运行：`"C:\Program Files\Docker\Docker\Docker Desktop.exe"`

2. **进入设置**
   - 点击右上角 ⚙️ Settings
   - 选择 **Resources** → **WSL Integration**

3. **启用 WSL 2 后端**
   - 确保 "Use WSL 2 instead of Hyper-V" 已勾选
   - Docker 会自动使用 WSL 2 存储

4. **重启 Docker**
   - 点击 "Restart" 按钮

---

### 方案二：手动迁移 Docker WSL 数据

如果 Docker Desktop 设置无法修改存储位置，可以手动迁移：

#### 步骤 1：停止 Docker

```powershell
# 以管理员身份打开 PowerShell
Stop-Process -Name "Docker Desktop" -Force
Stop-Process -Name "com.docker.*" -Force
```

#### 步骤 2：找到 Docker 数据文件

```powershell
# 查找 VHDX 文件
Get-ChildItem -Path "$env:LOCALAPPDATA\Docker" -Filter "*.vhdx" -Recurse
```

#### 步骤 3：导出 Docker WSL 实例

```powershell
# 查看 Docker WSL 实例
wsl --list

# 导出 Docker Desktop 数据
wsl --export docker-desktop D:\wsl-backup\docker-desktop.tar.gz

# 注销 C 盘的 Docker 实例
wsl --unregister docker-desktop

# 导入到 D 盘
New-Item -ItemType Directory -Path "D:\WSL\Docker" -Force
wsl --import docker-desktop D:\WSL\Docker D:\wsl-backup\docker-desktop.tar.gz --version 2
```

---

### 方案三：重新安装 Docker Desktop（最干净）

如果上述方法都不行，可以重新安装：

1. **备份容器数据**（如果需要）
   ```bash
   # 导出容器
   docker export timark-postgres > D:\postgres-container.tar
   
   # 导出镜像
   docker save postgres:14 > D:\postgres-image.tar
   ```

2. **卸载 Docker Desktop**
   - 控制面板 → 程序和功能
   - 找到 Docker Desktop → 卸载

3. **重新安装到 D 盘**
   - 运行安装程序
   - 安装时选择自定义路径：`D:\Program Files\Docker`

4. **恢复数据**
   ```bash
   # 导入镜像
   docker load < D:\postgres-image.tar
   
   # 启动容器
   docker run --name timark-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=timark_todo -p 5432:5432 -d postgres:14
   ```

---

## PostgreSQL 容器重建

迁移后需要重新创建 PostgreSQL 容器：

```bash
# 启动容器
docker run --name timark-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=timark_todo -p 5432:5432 -d postgres:14

# 验证
docker ps

# 初始化数据库（如果需要）
docker exec -i timark-postgres psql -U postgres -d timark_todo -f /dev/stdin < todo-app/init-db.sql
```

---

## 清理 C 盘空间

迁移完成后，可以删除备份文件：

```powershell
# 确认 D 盘数据正常后删除
Remove-Item "D:\wsl-backup\ubuntu.tar.gz" -Force
```

---

## 验证迁移

### 检查 WSL 位置

```powershell
wsl --list --verbose
wsl -d Ubuntu -e df -h
```

### 检查 Docker

```bash
docker ps
docker start timark-postgres
```

### 测试数据库连接

```bash
docker exec -i timark-postgres psql -U postgres -d timark_todo -c "SELECT 1"
```

---

## 常见问题

### Q1: Docker Desktop 无法启动

**解决方案**：
1. 确保 WSL 2 已正确安装
2. 重启电脑
3. 重新运行 Docker Desktop

### Q2: 容器无法启动

**解决方案**：
```bash
# 删除旧容器
docker rm -f timark-postgres

# 重新创建
docker run --name timark-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=timark_todo -p 5432:5432 -d postgres:14
```

### Q3: WSL 无法启动

**解决方案**：
```powershell
# 重启 WSL
wsl --shutdown

# 重新启动
wsl -d Ubuntu
```

---

## 磁盘空间对比

| 迁移前 | 迁移后 |
|--------|--------|
| C 盘：~5 GB | C 盘：~500 MB |
| D 盘：0 GB | D 盘：~5 GB |

**预计释放 C 盘空间**：约 4-5 GB
