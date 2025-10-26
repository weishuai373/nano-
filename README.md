# 🍌 Nano Banana - AI 图像生成器

一个功能强大的 AI 图像生成网站，支持与 Photoshop 无缝集成，让您的创作工作流更加顺畅。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 主要特性

### 🎨 Photoshop 集成
- **从 PS 粘贴**：直接 Ctrl+V 粘贴 Photoshop 中的选区到网站
- **发送到 PS**：一键复制生成的图片到剪贴板，无缝粘贴到 Photoshop

### 🔧 强大功能
- ⚙️ **API 中转支持**：支持第三方 API 中转服务配置
- 🌓 **主题切换**：优雅的黑白主题，保护您的眼睛
- 📜 **历史记录**：自动保存最近 50 条生成记录
- ⭐ **提示词收藏**：收藏您喜欢的提示词，随时复用
- 📐 **灵活尺寸**：支持多种预设尺寸和自定义尺寸
- 💾 **本地存储**：所有数据安全存储在浏览器本地

## 🚀 快速开始

### 在线使用（推荐）

1. 打开 `index.html` 即可使用
2. 点击右上角设置按钮 ⚙️
3. 配置您的 API 信息：
   - API 基础 URL（支持第三方中转）
   - API Key
   - 模型名称（默认：dall-e-3）
4. 开始生成图像！

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/nano-banana.git
cd nano-banana

# 直接打开 index.html，或使用本地服务器
python -m http.server 8000
# 或
npx serve
```

访问：`http://localhost:8000`

### 使用后端服务器（可选）

如果您想隐藏 API Key，可以使用后端服务器：

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的 API 配置

# 启动服务器
npm start
```

访问：`http://localhost:3000`

## 📖 使用指南

### 基础使用

1. **输入提示词**
   - 在"提示词"框中描述您想生成的图像
   - 可选：添加"负向提示词"排除不想要的内容

2. **选择尺寸**
   - 从预设尺寸中选择
   - 或选择"自定义"输入特定尺寸

3. **上传参考图**（可选）
   - 点击上传区域选择图片
   - 或直接从 Photoshop 粘贴（Ctrl+V）

4. **生成图像**
   - 点击"生成图像"按钮
   - 等待 AI 生成完成

### Photoshop 工作流

#### 从 PS 到网站：
1. 在 Photoshop 中选择要使用的图层或选区
2. 复制（Ctrl+C）
3. 在网站的上传区域粘贴（Ctrl+V）

#### 从网站到 PS：
1. 生成图像后，点击"复制到剪贴板"
2. 切换到 Photoshop
3. 粘贴（Ctrl+V）

### 提示词管理

#### 收藏提示词：
1. 输入提示词后，点击输入框右上角的 ⭐ 按钮
2. 提示词会保存到"收藏的提示词"标签页

#### 使用收藏：
1. 切换到"收藏的提示词"标签
2. 点击提示词卡片上的 📝 按钮
3. 提示词会自动填入输入框

### 历史记录

- 每次生成都会自动保存到历史记录
- 最多保存 50 条记录
- 点击历史记录中的图片可以重新查看
- 点击 🔄 按钮可以复用该提示词

## 🎨 功能截图

### 主界面
- 左侧：生成控制面板
- 右侧：结果显示区域
- 底部：收藏和历史标签页

### 黑色主题
点击右上角 🌙/☀️ 按钮切换主题

## 🔑 API 配置

### 使用 OpenAI 官方 API

```
API 基础 URL: https://api.openai.com/v1
API Key: sk-your-api-key-here
模型名称: dall-e-3
```

### 使用第三方中转

许多服务提供 OpenAI API 中转，例如：

```
API 基础 URL: https://your-proxy-service.com/v1
API Key: your-proxy-api-key
模型名称: dall-e-3
```

## 📁 项目结构

```
nano-banana/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── app.js         # 核心逻辑
├── public/
│   └── images/        # 静态图片
├── server.js          # 后端服务器（可选）
├── package.json       # 项目配置
├── .env.example       # 环境变量示例
├── DEPLOYMENT.md      # 部署指南
└── README.md          # 说明文档
```

## 🚀 部署到 VPS

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署（Nginx）

```bash
# 克隆项目到服务器
cd /var/www
git clone https://github.com/your-username/nano-banana.git

# 配置 Nginx
sudo nano /etc/nginx/sites-available/nano-banana

# 重启 Nginx
sudo systemctl restart nginx
```

### 使用 PM2 部署后端

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env

# 使用 PM2 启动
pm2 start server.js --name nano-banana
pm2 save
```

## 🔧 技术栈

- **前端**：纯 HTML/CSS/JavaScript
- **后端**（可选）：Node.js + Express
- **API**：OpenAI DALL-E 3
- **存储**：LocalStorage
- **部署**：Nginx / PM2

## 🛠️ 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**注意**：复制到剪贴板功能需要现代浏览器支持 Clipboard API

## 📝 开发计划

- [ ] 支持更多 AI 模型（Stable Diffusion, Midjourney 等）
- [ ] 添加图像编辑功能
- [ ] 支持批量生成
- [ ] 用户账户系统
- [ ] 云端同步收藏和历史
- [ ] 更多导出格式

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- OpenAI 提供的强大 DALL-E 3 API
- 所有贡献者和用户

## 💬 联系方式

- Issues: [GitHub Issues](https://github.com/your-username/nano-banana/issues)
- Email: your-email@example.com

## 🌟 Star History

如果这个项目对您有帮助，请给我们一个 Star ⭐️

---

**Happy Creating! 🍌🎨**
