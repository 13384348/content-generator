# 内容生成器 - 生产环境部署指南

## 🚀 快速开始

### 系统要求

- Ubuntu 20.04+ / CentOS 7+
- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB RAM
- 至少 20GB 存储空间

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将用户添加到 docker 组
sudo usermod -aG docker $USER
```

### 2. 项目部署

```bash
# 克隆项目
git clone <your-repository-url>
cd content-generator-versions/version3-step-wizard

# 复制并配置环境变量
cp backend/.env.example .env
nano .env  # 编辑配置文件

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

## 🔧 配置文件详解

### 环境变量配置 (.env)

```env
# 必须修改的配置
NODE_ENV=production
DB_USER=your_secure_db_user
DB_PASSWORD=your_secure_db_password
DB_NAME=content_generator
JWT_SECRET=your_very_secure_jwt_secret_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# 可选配置
CORS_ORIGIN=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 域名和SSL配置

1. **配置域名DNS解析**
   - 将域名A记录指向服务器IP

2. **获取SSL证书**
   ```bash
   # 使用 Let's Encrypt (推荐)
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com

   # 或手动配置证书
   mkdir -p nginx/ssl
   # 将证书文件复制到 nginx/ssl/cert.pem
   # 将私钥文件复制到 nginx/ssl/key.pem
   ```

3. **更新Nginx配置**
   ```bash
   # 编辑 nginx/nginx.conf
   nano nginx/nginx.conf
   # 修改 server_name 为你的域名

   # 重启nginx
   docker-compose restart nginx
   ```

## 📊 监控和维护

### 查看服务状态

```bash
# 查看所有容器状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f postgres
```

### 数据库管理

```bash
# 连接数据库
docker-compose exec postgres psql -U your_db_user -d content_generator

# 数据库备份
docker-compose exec postgres pg_dump -U your_db_user content_generator > backup.sql

# 数据库恢复
cat backup.sql | docker-compose exec -T postgres psql -U your_db_user -d content_generator
```

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 安全配置

### 防火墙设置

```bash
# 安装 ufw
sudo apt install ufw

# 允许SSH
sudo ufw allow 22

# 允许HTTP和HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 启用防火墙
sudo ufw enable
```

### 定期备份

```bash
# 添加到定时任务
crontab -e

# 每天凌晨2点备份
0 2 * * * /path/to/your/backup-script.sh
```

创建备份脚本 `backup-script.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/content-generator"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
docker-compose exec postgres pg_dump -U your_db_user content_generator > $BACKUP_DIR/db_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# 删除30天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

## 🚨 故障排查

### 常见问题

1. **应用无法启动**
   ```bash
   # 查看详细错误日志
   docker-compose logs app

   # 检查环境变量配置
   docker-compose exec app env | grep -E "(DB_|JWT_|NODE_ENV)"
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose exec postgres pg_isready -U your_db_user

   # 检查数据库日志
   docker-compose logs postgres
   ```

3. **SSL证书问题**
   ```bash
   # 检查证书有效期
   openssl x509 -in nginx/ssl/cert.pem -text -noout

   # 测试SSL配置
   curl -I https://yourdomain.com
   ```

### 性能优化

1. **数据库优化**
   - 定期清理日志表
   - 分析查询性能
   - 配置适当的连接池

2. **Nginx优化**
   - 启用Gzip压缩
   - 配置静态文件缓存
   - 调整worker进程数

3. **应用优化**
   - 使用Redis缓存热数据
   - 配置PM2集群模式
   - 监控内存和CPU使用

## 📈 监控告警

### 集成监控工具

推荐使用以下监控解决方案：
- **Prometheus + Grafana**: 系统指标监控
- **ELK Stack**: 日志分析
- **Sentry**: 错误追踪
- **UptimeRobot**: 服务可用性监控

## 🆘 技术支持

如需技术支持，请提供以下信息：
- 服务器系统版本
- Docker版本
- 错误日志内容
- 问题复现步骤

---

**注意**: 首次部署后请立即修改所有默认密码和密钥！