// 主题切换功能
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// 检查本地存储中的主题设置
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

// 更新主题切换按钮的图标
function updateThemeIcon() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const icon = themeToggle.querySelector('svg');
    icon.innerHTML = isDark ? 
        '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>' : 
        '<path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
}

// 切换主题
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
    
    // 更新分形动画颜色
    updateFractalColors(newTheme);
});

// 初始化主题图标
updateThemeIcon();

// 分形动画代码
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const fractalCanvas = document.getElementById('fractalCanvas');
fractalCanvas.appendChild(canvas);

// 设置画布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 分形参数
let time = 0;
let colors = [
    '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff'
];

// 更新分形颜色
function updateFractalColors(theme) {
    if (theme === 'light') {
        colors = [
            '#ff6b6b', '#4CAF50', '#2196F3',
            '#FFC107', '#9C27B0', '#00BCD4'
        ];
    } else {
        colors = [
            '#ff0000', '#00ff00', '#0000ff',
            '#ffff00', '#ff00ff', '#00ffff'
        ];
    }
}

// 绘制分形
function drawFractal() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;
    
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + time;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        drawBranch(x, y, angle, 0, colors[i]);
    }
    
    time += 0.01;
    requestAnimationFrame(drawFractal);
}

// 绘制分支
function drawBranch(x, y, angle, depth, color) {
    if (depth > 8) return;
    
    const length = 50 * Math.pow(0.7, depth);
    const newX = x + Math.cos(angle) * length;
    const newY = y + Math.sin(angle) * length;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(newX, newY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * Math.pow(0.7, depth);
    ctx.stroke();
    
    // 递归绘制子分支
    drawBranch(newX, newY, angle + Math.PI / 4, depth + 1, color);
    drawBranch(newX, newY, angle - Math.PI / 4, depth + 1, color);
}

// 开始动画
drawFractal();

// 画廊数据
const galleryItems = [
    {
        title: '分形艺术 1',
        description: '无限细节的美丽图案'
    },
    {
        title: '分形艺术 2',
        description: '数学与艺术的完美结合'
    },
    {
        title: '分形艺术 3',
        description: '自然界的数学之美'
    }
];

// 生成画廊内容
const galleryGrid = document.querySelector('.gallery-grid');
galleryItems.forEach(item => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
    `;
    galleryGrid.appendChild(galleryItem);
}); 