// ===== 应用状态管理 =====
const AppState = {
    currentTheme: 'light',
    settings: {
        apiKey: '',
        apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'
    },
    favorites: [],
    history: [],
    currentImage: null,
    uploadedImage: null
};

// ===== 初始化应用 =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍌 Nano Banana 图像生成器启动中...');
    initializeApp();
});

function initializeApp() {
    loadSettings();
    loadFavorites();
    loadHistory();
    setupEventListeners();
    updateTheme();
    console.log('✅ Nano Banana 图像生成器已就绪！');
}

// ===== 本地存储管理 =====
function loadSettings() {
    const savedSettings = localStorage.getItem('nanoBananaSettings');
    if (savedSettings) {
        AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
    }

    // 更新 UI
    if (document.getElementById('apiKey')) {
        document.getElementById('apiKey').value = AppState.settings.apiKey || '';
    }
    if (document.getElementById('apiEndpoint')) {
        document.getElementById('apiEndpoint').value = AppState.settings.apiEndpoint;
    }

    const savedTheme = localStorage.getItem('nanoBananaTheme') || 'light';
    AppState.currentTheme = savedTheme;
}

function saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const apiEndpoint = document.getElementById('apiEndpoint').value.trim();

    AppState.settings.apiKey = apiKey;
    AppState.settings.apiEndpoint = apiEndpoint;

    localStorage.setItem('nanoBananaSettings', JSON.stringify(AppState.settings));
    showNotification('设置已保存', 'success');
    closeSettingsModal();
}

function loadFavorites() {
    const saved = localStorage.getItem('nanoBananaFavorites');
    if (saved) {
        AppState.favorites = JSON.parse(saved);
        renderFavorites();
    }
}

function saveFavorites() {
    localStorage.setItem('nanoBananaFavorites', JSON.stringify(AppState.favorites));
}

function loadHistory() {
    const saved = localStorage.getItem('nanoBananaHistory');
    if (saved) {
        AppState.history = JSON.parse(saved);
        renderHistory();
    }
}

function saveHistory() {
    // 只保留最近50条
    if (AppState.history.length > 50) {
        AppState.history = AppState.history.slice(0, 50);
    }
    localStorage.setItem('nanoBananaHistory', JSON.stringify(AppState.history));
}

// ===== 主题切换 =====
function toggleTheme() {
    AppState.currentTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('nanoBananaTheme', AppState.currentTheme);
    updateTheme();
}

function updateTheme() {
    const html = document.documentElement;
    const themeIcon = document.querySelector('.theme-icon');

    if (AppState.currentTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        html.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
}

// ===== 事件监听器设置 =====
function setupEventListeners() {
    console.log('设置事件监听器...');

    // 主题切换
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('✓ 主题切换按钮已绑定');
    }

    // 设置模态框
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
        console.log('✓ 设置按钮已绑定');
    }

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
        console.log('✓ 保存设置按钮已绑定');
    }

    // 关闭模态框
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeSettingsModal);
    });

    // 点击模态框外部关闭
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                closeSettingsModal();
            }
        });
    }

    // 图片尺寸选择
    const imageSize = document.getElementById('imageSize');
    if (imageSize) {
        imageSize.addEventListener('change', handleSizeChange);
        console.log('✓ 尺寸选择已绑定');
    }

    // 文件上传
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', handleFileUpload);
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        console.log('✓ 文件上传已绑定');
    }

    // 粘贴从 Photoshop
    document.addEventListener('paste', handlePaste);
    console.log('✓ 粘贴功能已绑定');

    // 生成按钮
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateImage);
        console.log('✓ 生成按钮已绑定');
    }

    // 结果操作
    const copyBtn = document.getElementById('copyToClipboardBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadImage);
    }

    // 保存提示词
    const savePromptBtn = document.getElementById('savePromptBtn');
    if (savePromptBtn) {
        savePromptBtn.addEventListener('click', saveCurrentPrompt);
        console.log('✓ 保存提示词按钮已绑定');
    }

    // 标签页切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    console.log('✓ 标签页切换已绑定');
}

// ===== 模态框控制 =====
function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('show');
        console.log('打开设置模态框');
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('show');
        console.log('关闭设置模态框');
    }
}

// ===== 图片尺寸控制 =====
function handleSizeChange(e) {
    const customPanel = document.getElementById('customSizePanel');
    if (customPanel) {
        if (e.target.value === 'custom') {
            customPanel.style.display = 'block';
        } else {
            customPanel.style.display = 'none';
        }
    }
}

function getImageSize() {
    const sizeValue = document.getElementById('imageSize').value;

    if (sizeValue === 'custom') {
        const width = document.getElementById('customWidth').value;
        const height = document.getElementById('customHeight').value;
        return { width: parseInt(width), height: parseInt(height) };
    }

    const [width, height] = sizeValue.split('x').map(Number);
    return { width, height };
}

// ===== 文件上传处理 =====
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        readImageFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        readImageFile(file);
    }
}

function readImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        AppState.uploadedImage = e.target.result;
        displayUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

function displayUploadedImage(dataUrl) {
    const uploadPrompt = document.querySelector('.upload-prompt');
    const previewImage = document.getElementById('previewImage');

    if (uploadPrompt) uploadPrompt.style.display = 'none';
    if (previewImage) {
        previewImage.src = dataUrl;
        previewImage.style.display = 'block';
    }
}

// ===== Photoshop 集成 - 粘贴功能 =====
async function handlePaste(e) {
    const items = e.clipboardData.items;

    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
                AppState.uploadedImage = event.target.result;
                displayUploadedImage(event.target.result);
                showNotification('已从剪贴板粘贴图片', 'success');
            };
            reader.readAsDataURL(blob);
            break;
        }
    }
}

// ===== Photoshop 集成 - 复制功能 =====
async function copyToClipboard() {
    if (!AppState.currentImage) {
        showNotification('没有可复制的图片', 'error');
        return;
    }

    try {
        // 将 base64 转换为 blob
        const response = await fetch(AppState.currentImage);
        const blob = await response.blob();

        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);

        showNotification('图片已复制到剪贴板，可以直接粘贴到 Photoshop!', 'success');
    } catch (err) {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动下载图片', 'error');
    }
}

// ===== 图像生成核心功能 - Google Gemini 2.5 Flash Image API =====
async function generateImage() {
    const prompt = document.getElementById('prompt').value.trim();

    if (!prompt) {
        showNotification('请输入提示词', 'error');
        return;
    }

    if (!AppState.settings.apiKey) {
        showNotification('请先在设置中配置 Google AI API Key', 'error');
        openSettingsModal();
        return;
    }

    const generateBtn = document.getElementById('generateBtn');
    const generateBtnText = document.getElementById('generateBtnText');

    // 禁用按钮并显示加载状态
    generateBtn.disabled = true;
    generateBtnText.innerHTML = '生成中... <span class="loading"></span>';

    try {
        console.log('开始生成图像...');
        const imageDataUrl = await callGeminiImageAPI(prompt);

        // 显示生成的图片
        displayGeneratedImage(imageDataUrl);

        // 添加到历史记录
        addToHistory(prompt, imageDataUrl);

        showNotification('图片生成成功!', 'success');
    } catch (error) {
        console.error('生成失败:', error);
        showNotification('生成失败: ' + error.message, 'error');
    } finally {
        // 恢复按钮状态
        generateBtn.disabled = false;
        generateBtnText.innerHTML = '生成图像';
    }
}

async function callGeminiImageAPI(prompt) {
    const negativePrompt = document.getElementById('negativePrompt').value.trim();

    // 组合正向和负向提示词
    let fullPrompt = prompt;
    if (negativePrompt) {
        fullPrompt += `\n\nAvoid: ${negativePrompt}`;
    }

    const size = getImageSize();

    // 添加尺寸信息到提示词
    if (size.width !== 1024 || size.height !== 1024) {
        fullPrompt += `\n\nAspect ratio: ${size.width}x${size.height}`;
    }

    console.log('调用 Gemini API:', fullPrompt);

    // 调用 Google Gemini 2.5 Flash Image API
    const response = await fetch(AppState.settings.apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': AppState.settings.apiKey
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: fullPrompt
                }]
            }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API 错误响应:', errorText);
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API 响应:', data);

    // 提取图片数据 (Gemini 返回 base64 编码的图片)
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const parts = data.candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                // 返回 base64 格式的图片
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error('无法从响应中提取图片数据');
}

function displayGeneratedImage(imageDataUrl) {
    AppState.currentImage = imageDataUrl;

    const resultArea = document.getElementById('resultArea');
    if (resultArea) {
        resultArea.innerHTML = `<img id="generatedImage" src="${imageDataUrl}" alt="生成的图片">`;
    }

    const resultActions = document.getElementById('resultActions');
    if (resultActions) {
        resultActions.style.display = 'flex';
    }
}

// ===== 历史记录管理 =====
function addToHistory(prompt, imageDataUrl) {
    const size = getImageSize();
    const historyItem = {
        id: Date.now(),
        prompt: prompt,
        imageUrl: imageDataUrl,
        timestamp: new Date().toISOString(),
        size: `${size.width}x${size.height}`
    };

    AppState.history.unshift(historyItem);
    saveHistory();
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (AppState.history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">暂无历史记录</p>';
        return;
    }

    historyList.innerHTML = AppState.history.map(item => `
        <div class="history-item">
            <div class="history-item-header">
                <div class="history-item-prompt">${escapeHtml(item.prompt)}</div>
                <div class="history-item-actions">
                    <button class="btn-icon-small" onclick="reusePrompt(\`${escapeHtml(item.prompt)}\`)" title="复用提示词">🔄</button>
                    <button class="btn-icon-small" onclick="deleteHistoryItem(${item.id})" title="删除">🗑️</button>
                </div>
            </div>
            <div class="history-item-image">
                <img src="${item.imageUrl}" alt="历史图片" onclick="viewImage(\`${item.imageUrl}\`)">
            </div>
            <div class="history-item-meta">
                ${new Date(item.timestamp).toLocaleString('zh-CN')} | ${item.size}
            </div>
        </div>
    `).join('');
}

function deleteHistoryItem(id) {
    AppState.history = AppState.history.filter(item => item.id !== id);
    saveHistory();
    renderHistory();
    showNotification('已删除历史记录', 'success');
}

function viewImage(imageUrl) {
    AppState.currentImage = imageUrl;
    displayGeneratedImage(imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 收藏管理 =====
function saveCurrentPrompt() {
    const prompt = document.getElementById('prompt').value.trim();

    if (!prompt) {
        showNotification('请先输入提示词', 'error');
        return;
    }

    // 检查是否已存在
    if (AppState.favorites.some(fav => fav.prompt === prompt)) {
        showNotification('此提示词已收藏', 'warning');
        return;
    }

    const favorite = {
        id: Date.now(),
        prompt: prompt,
        negativePrompt: document.getElementById('negativePrompt').value.trim(),
        timestamp: new Date().toISOString()
    };

    AppState.favorites.unshift(favorite);
    saveFavorites();
    renderFavorites();
    showNotification('提示词已收藏', 'success');
}

function renderFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;

    if (AppState.favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">暂无收藏的提示词</p>';
        return;
    }

    favoritesList.innerHTML = AppState.favorites.map(fav => `
        <div class="favorite-item">
            <div class="favorite-item-header">
                <div class="favorite-item-prompt">${escapeHtml(fav.prompt)}</div>
                <div class="favorite-item-actions">
                    <button class="btn-icon-small" onclick="useFavorite(${fav.id})" title="使用">📝</button>
                    <button class="btn-icon-small" onclick="deleteFavorite(${fav.id})" title="删除">🗑️</button>
                </div>
            </div>
            ${fav.negativePrompt ? `<div style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">负向: ${escapeHtml(fav.negativePrompt)}</div>` : ''}
            <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                ${new Date(fav.timestamp).toLocaleString('zh-CN')}
            </div>
        </div>
    `).join('');
}

function useFavorite(id) {
    const favorite = AppState.favorites.find(fav => fav.id === id);
    if (favorite) {
        document.getElementById('prompt').value = favorite.prompt;
        document.getElementById('negativePrompt').value = favorite.negativePrompt || '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showNotification('已应用收藏的提示词', 'success');
    }
}

function deleteFavorite(id) {
    AppState.favorites = AppState.favorites.filter(fav => fav.id !== id);
    saveFavorites();
    renderFavorites();
    showNotification('已删除收藏', 'success');
}

function reusePrompt(prompt) {
    document.getElementById('prompt').value = prompt;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showNotification('已复用提示词', 'success');
}

// ===== 标签页切换 =====
function switchTab(tabName) {
    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'favorites') {
        const favTab = document.getElementById('favoritesTab');
        if (favTab) favTab.classList.add('active');
    } else if (tabName === 'history') {
        const histTab = document.getElementById('historyTab');
        if (histTab) histTab.classList.add('active');
    }
}

// ===== 下载图片 =====
function downloadImage() {
    if (!AppState.currentImage) {
        showNotification('没有可下载的图片', 'error');
        return;
    }

    const link = document.createElement('a');
    link.href = AppState.currentImage;
    link.download = `nano-banana-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('图片下载中...', 'success');
}

// ===== 工具函数 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${colors[type] || colors.info};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .loading {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
        margin-left: 8px;
        vertical-align: middle;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
