# Nano Banana 图像生成器 - VPS 部署指南

本指南将详细说明如何将 Nano Banana 图像生成器部署到 VPS 服务器上。

## 目录
- [前置要求](#前置要求)
- [部署方式选择](#部署方式选择)
- [方式一：纯前端部署（推荐）](#方式一纯前端部署推荐)
- [方式二：带后端的完整部署](#方式二带后端的完整部署)
- [使用 Nginx 反向代理](#使用-nginx-反向代理)
- [SSL 证书配置](#ssl-证书配置)
- [维护和更新](#维护和更新)

---

## 前置要求

### 服务器要求
- Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- 至少 1GB RAM
- 至少 10GB 可用磁盘空间
- 公网 IP 地址

### 软件要求
- Node.js 16+ (如果使用后端)
- Nginx (推荐)
- Git

---

## 部署方式选择

### 方式一：纯前端部署
**优点：**
- 简单快速，无需 Node.js
- 资源占用少
- 适合个人使用

**缺点：**
- API Key 暴露在前端（可通过浏览器插件等方式查看）
- 不能隐藏 API 调用细节

### 方式二：带后端的完整部署
**优点：**
- API Key 安全保存在服务器端
- 可以添加更多后端功能（如用户系统、数据库等）
- 更专业的架构

**缺点：**
- 需要配置 Node.js 环境
- 资源占用稍多

---

## 方式一：纯前端部署（推荐）

### 1. 连接到 VPS

```bash
ssh root@your_server_ip
```

### 2. 安装 Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx -y
```

**CentOS:**
```bash
sudo yum install nginx -y
```

### 3. 克隆项目

```bash
cd /var/www
git clone https://github.com/your-username/nano-banana.git
cd nano-banana
```

或者直接上传文件：
```bash
# 在本地打包
tar -czf nano-banana.tar.gz index.html css/ js/ public/

# 上传到服务器
scp nano-banana.tar.gz root@your_server_ip:/var/www/

# 在服务器上解压
ssh root@your_server_ip
cd /var/www
tar -xzf nano-banana.tar.gz
mv nano-banana.tar.gz nano-banana/
```

### 4. 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/nano-banana
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your_domain.com;  # 替换为您的域名或 IP

    root /var/www/nano-banana;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 5. 启用网站

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/nano-banana /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

### 6. 配置防火墙

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

现在可以通过 `http://your_server_ip` 访问网站了！

---

## 方式二：带后端的完整部署

### 1. 安装 Node.js

```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# 验证安装
node --version
npm --version
```

### 2. 克隆并安装项目

```bash
cd /var/www
git clone https://github.com/your-username/nano-banana.git
cd nano-banana

# 安装依赖
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

编辑 `.env` 文件：

```env
# API Configuration
API_BASE_URL=https://api.openai.com/v1
API_KEY=sk-your-api-key-here

# Server Configuration
PORT=3000
```

### 4. 使用 PM2 管理进程

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start server.js --name nano-banana

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs nano-banana
```

### 5. 配置 Nginx 反向代理

```bash
sudo nano /etc/nginx/sites-available/nano-banana
```

添加配置：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 限制请求大小
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置（图像生成可能需要较长时间）
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/nano-banana /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 使用 Nginx 反向代理

如果您的应用运行在非标准端口（如 3000），建议使用 Nginx 作为反向代理：

### 优势
- 隐藏真实端口
- 提供 SSL/TLS 支持
- 负载均衡
- 缓存静态资源
- Gzip 压缩

---

## SSL 证书配置

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d your_domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

Certbot 会自动修改 Nginx 配置，添加 SSL 支持。

### 手动配置 SSL（如果需要）

```nginx
server {
    listen 443 ssl http2;
    server_name your_domain.com;

    ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 其他配置...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your_domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 维护和更新

### 更新代码

```bash
cd /var/www/nano-banana
git pull origin main

# 如果使用后端
npm install  # 安装新依赖
pm2 restart nano-banana  # 重启应用
```

### 查看日志

**Nginx 日志：**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**应用日志（PM2）：**
```bash
pm2 logs nano-banana
pm2 logs nano-banana --lines 100
```

### 监控资源使用

```bash
# PM2 监控
pm2 monit

# 系统资源
htop
df -h
free -m
```

### 备份

```bash
# 备份项目
tar -czf nano-banana-backup-$(date +%Y%m%d).tar.gz /var/www/nano-banana

# 备份配置
sudo tar -czf nginx-backup-$(date +%Y%m%d).tar.gz /etc/nginx/sites-available/
```

---

## 故障排查

### 网站无法访问

1. 检查 Nginx 状态：
   ```bash
   sudo systemctl status nginx
   ```

2. 检查端口是否开放：
   ```bash
   sudo netstat -tlnp | grep :80
   ```

3. 检查防火墙：
   ```bash
   sudo ufw status
   ```

### 后端服务问题

1. 检查 PM2 状态：
   ```bash
   pm2 status
   pm2 logs nano-banana --err
   ```

2. 手动运行测试：
   ```bash
   cd /var/www/nano-banana
   node server.js
   ```

### 权限问题

```bash
# 设置正确的文件权限
sudo chown -R www-data:www-data /var/www/nano-banana
sudo chmod -R 755 /var/www/nano-banana
```

---

## 性能优化建议

1. **启用 HTTP/2**（需要 SSL）
2. **配置缓存头**
3. **启用 Gzip 压缩**
4. **使用 CDN** 加速静态资源
5. **优化图片大小**
6. **监控服务器资源**

---

## 安全建议

1. **定期更新系统**：`sudo apt update && sudo apt upgrade`
2. **配置防火墙**：只开放必要端口
3. **使用强密码**
4. **启用 SSH 密钥认证**
5. **定期备份数据**
6. **监控异常访问**

---

## 常用命令速查

```bash
# Nginx
sudo systemctl status nginx    # 查看状态
sudo systemctl restart nginx   # 重启
sudo nginx -t                  # 测试配置

# PM2
pm2 list                       # 列出所有应用
pm2 restart nano-banana        # 重启应用
pm2 stop nano-banana          # 停止应用
pm2 delete nano-banana        # 删除应用

# 系统
df -h                         # 磁盘使用
free -m                       # 内存使用
top                          # 进程监控
```

---

## 需要帮助？

如果遇到问题，请检查：
1. Nginx 错误日志：`/var/log/nginx/error.log`
2. 应用日志：`pm2 logs`
3. 系统日志：`/var/log/syslog`

祝您部署顺利！🍌
