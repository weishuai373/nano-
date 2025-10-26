// ===== 应用状态管理 =====
const AppState = {
    currentTheme: 'light',
    settings: {
        apiBaseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        modelName: 'dall-e-3'
    },
    favorites: [],
    history: [],
    currentImage: null,
    uploadedImage: null
};

// ===== 初始化应用 =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadSettings();
    loadFavorites();
    loadHistory();
    setupEventListeners();
    updateTheme();
    console.log('Nano Banana 图像生成器已加载');
}

// ===== 本地存储管理 =====
function loadSettings() {
    const savedSettings = localStorage.getItem('nanoBananaSettings');
    if (savedSettings) {
        AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
        document.getElementById('apiBaseUrl').value = AppState.settings.apiBaseUrl;
        document.getElementById('apiKey').value = AppState.settings.apiKey;
        document.getElementById('modelName').value = AppState.settings.modelName;
    }

    const savedTheme = localStorage.getItem('nanoBananaTheme') || 'light';
    AppState.currentTheme = savedTheme;
}

function saveSettings() {
    AppState.settings.apiBaseUrl = document.getElementById('apiBaseUrl').value;
    AppState.settings.apiKey = document.getElementById('apiKey').value;
    AppState.settings.modelName = document.getElementById('modelName').value;
    localStorage.setItem('nanoBananaSettings', JSON.stringify(AppState.settings));
    showNotification('设置已保存', 'success');
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
        themeIcon.textContent = '☀️';
    } else {
        html.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
    }
}

// ===== 事件监听器设置 =====
function setupEventListeners() {
    // 主题切换
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // 设置模态框
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        saveSettings();
        closeSettingsModal();
    });

    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeSettingsModal);
    });

    // 点击模态框外部关闭
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            closeSettingsModal();
        }
    });

    // 图片尺寸选择
    document.getElementById('imageSize').addEventListener('change', handleSizeChange);

    // 文件上传
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    uploadArea.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleFileUpload);

    // 拖放上传
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // 粘贴从 Photoshop
    document.addEventListener('paste', handlePaste);

    // 生成按钮
    document.getElementById('generateBtn').addEventListener('click', generateImage);

    // 结果操作
    document.getElementById('copyToClipboardBtn').addEventListener('click', copyToClipboard);
    document.getElementById('downloadBtn').addEventListener('click', downloadImage);

    // 保存提示词
    document.getElementById('savePromptBtn').addEventListener('click', saveCurrentPrompt);

    // 标签页切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

// ===== 模态框控制 =====
function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

// ===== 图片尺寸控制 =====
function handleSizeChange(e) {
    const customPanel = document.getElementById('customSizePanel');
    if (e.target.value === 'custom') {
        customPanel.style.display = 'block';
    } else {
        customPanel.style.display = 'none';
    }
}

function getImageSize() {
    const sizeValue = document.getElementById('imageSize').value;

    if (sizeValue === 'custom') {
        const width = document.getElementById('customWidth').value;
        const height = document.getElementById('customHeight').value;
        return `${width}x${height}`;
    }

    return sizeValue;
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

    uploadPrompt.style.display = 'none';
    previewImage.src = dataUrl;
    previewImage.style.display = 'block';
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

// ===== 图像生成核心功能 =====
async function generateImage() {
    const prompt = document.getElementById('prompt').value.trim();

    if (!prompt) {
        showNotification('请输入提示词', 'error');
        return;
    }

    if (!AppState.settings.apiKey) {
        showNotification('请先在设置中配置 API Key', 'error');
        openSettingsModal();
        return;
    }

    const generateBtn = document.getElementById('generateBtn');
    const generateBtnText = document.getElementById('generateBtnText');

    // 禁用按钮并显示加载状态
    generateBtn.disabled = true;
    generateBtnText.innerHTML = '<span class="loading"></span> 生成中...';

    try {
        const imageUrl = await callImageGenerationAPI(prompt);

        // 显示生成的图片
        displayGeneratedImage(imageUrl);

        // 添加到历史记录
        addToHistory(prompt, imageUrl);

        showNotification('图片生成成功!', 'success');
    } catch (error) {
        console.error('生成失败:', error);
        showNotification('生成失败: ' + error.message, 'error');
    } finally {
        // 恢复按钮状态
        generateBtn.disabled = false;
        generateBtnText.textContent = '生成图像';
    }
}

async function callImageGenerationAPI(prompt) {
    const negativePrompt = document.getElementById('negativePrompt').value.trim();
    const size = getImageSize();
    const [width, height] = size.split('x');

    // 使用 DALL-E 3 API
    const response = await fetch(`${AppState.settings.apiBaseUrl}/images/generations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AppState.settings.apiKey}`
        },
        body: JSON.stringify({
            model: AppState.settings.modelName,
            prompt: prompt,
            n: 1,
            size: size === '1024x1024' || size === '1024x768' || size === '768x1024' ? size : '1024x1024',
            quality: 'standard'
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '生成失败');
    }

    const data = await response.json();
    return data.data[0].url;
}

function displayGeneratedImage(imageUrl) {
    AppState.currentImage = imageUrl;

    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = `<img id="generatedImage" src="${imageUrl}" alt="生成的图片">`;

    document.getElementById('resultActions').style.display = 'flex';
}

// ===== 历史记录管理 =====
function addToHistory(prompt, imageUrl) {
    const historyItem = {
        id: Date.now(),
        prompt: prompt,
        imageUrl: imageUrl,
        timestamp: new Date().toISOString(),
        size: getImageSize()
    };

    AppState.history.unshift(historyItem);
    saveHistory();
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');

    if (AppState.history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">暂无历史记录</p>';
        return;
    }

    historyList.innerHTML = AppState.history.map(item => `
        <div class="history-item">
            <div class="history-item-header">
                <div class="history-item-prompt">${escapeHtml(item.prompt)}</div>
                <div class="history-item-actions">
                    <button class="btn-icon-small" onclick="reusePrompt('${escapeHtml(item.prompt)}')" title="复用提示词">🔄</button>
                    <button class="btn-icon-small" onclick="deleteHistoryItem(${item.id})" title="删除">🗑️</button>
                </div>
            </div>
            <div class="history-item-image">
                <img src="${item.imageUrl}" alt="历史图片" onclick="viewImage('${item.imageUrl}')">
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
        document.getElementById('favoritesTab').classList.add('active');
    } else if (tabName === 'history') {
        document.getElementById('historyTab').classList.add('active');
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

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--accent-color)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
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
`;
document.head.appendChild(style);
