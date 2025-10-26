const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// API 代理端点 - 用于隐藏 API Key
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, size, model } = req.body;

        // 验证必需参数
        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        // 从环境变量获取 API 配置
        const apiBaseUrl = process.env.API_BASE_URL || 'https://api.openai.com/v1';
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API_KEY not configured on server' });
        }

        // 调用图像生成 API
        const response = await axios.post(
            `${apiBaseUrl}/images/generations`,
            {
                model: model || 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: size || '1024x1024',
                quality: 'standard'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 60000 // 60秒超时
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);

        if (error.response) {
            // API 返回了错误
            res.status(error.response.status).json({
                error: error.response.data.error?.message || 'API request failed'
            });
        } else if (error.code === 'ECONNABORTED') {
            // 请求超时
            res.status(504).json({ error: 'Request timeout' });
        } else {
            // 其他错误
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 图像代理端点 - 用于解决跨域问题
app.get('/api/proxy-image', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'Missing image URL' });
        }

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).json({ error: 'Failed to proxy image' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║  🍌 Nano Banana Server                    ║
║  Server running on port ${PORT}             ║
║  http://localhost:${PORT}                   ║
╚═══════════════════════════════════════════╝
    `);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
