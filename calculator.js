// 获取DOM元素
const marginInput = document.getElementById('margin');
const confidenceInput = document.getElementById('confidence');
const populationInput = document.getElementById('population');
const proportionInput = document.getElementById('proportion');
const sampleSizeOutput = document.getElementById('sample-size');
const scenariosGrid = document.querySelector('.scenarios-grid');

// Z值查找表
const zScores = {
    80: 1.28,
    85: 1.44,
    90: 1.645,
    95: 1.96,
    99: 2.576
};

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
});

// 初始化主题图标
updateThemeIcon();

// 计算样本量
function calculateSampleSize(margin, confidence, population, proportion) {
    // 将百分比转换为小数
    margin = margin / 100;
    proportion = proportion / 100;
    
    // 获取最接近的Z值
    let z = 1.96; // 默认95%置信水平
    const confidenceLevels = Object.keys(zScores).map(Number);
    const closestConfidence = confidenceLevels.reduce((prev, curr) => {
        return Math.abs(curr - confidence) < Math.abs(prev - confidence) ? curr : prev;
    });
    z = zScores[closestConfidence];
    
    // 计算X
    const x = Math.pow(z, 2) * proportion * (1 - proportion) / Math.pow(margin, 2);
    
    // 应用有限总体修正
    const n = Math.ceil((population * x) / (x + population - 1));
    
    return n;
}

// 更新替代方案
function updateAlternativeScenarios(currentValues) {
    const scenarios = [
        {
            title: '样本量',
            values: [100, 1000, 10000],
            calculate: (value) => {
                const p = currentValues.proportion / 100;
                const z = zScores[95];
                const n = value;
                return (Math.sqrt(p * (1-p) / n) * z * 100).toFixed(2) + '%';
            }
        },
        {
            title: '误差范围',
            values: [1, 2, 5],
            calculate: (value) => calculateSampleSize(
                value,
                currentValues.confidence,
                currentValues.population,
                currentValues.proportion
            )
        },
        {
            title: '置信水平',
            values: [90, 95, 99],
            calculate: (value) => calculateSampleSize(
                currentValues.margin,
                value,
                currentValues.population,
                currentValues.proportion
            )
        }
    ];
    
    // 清空现有内容
    scenariosGrid.innerHTML = '';
    
    // 生成替代方案表格
    scenarios.forEach(scenario => {
        const row = document.createElement('div');
        row.className = 'scenario-item';
        
        const title = document.createElement('h4');
        title.textContent = scenario.title;
        row.appendChild(title);
        
        const valuesList = document.createElement('div');
        valuesList.className = 'scenario-values';
        
        scenario.values.forEach(value => {
            const result = scenario.calculate(value);
            const valueItem = document.createElement('div');
            valueItem.className = 'scenario-value';
            valueItem.innerHTML = `${value}${scenario.title === '样本量' ? '' : '%'} → ${result}`;
            valuesList.appendChild(valueItem);
        });
        
        row.appendChild(valuesList);
        scenariosGrid.appendChild(row);
    });
}

// 更新计算结果
function updateResults() {
    const values = {
        margin: parseFloat(marginInput.value),
        confidence: parseFloat(confidenceInput.value),
        population: parseInt(populationInput.value),
        proportion: parseFloat(proportionInput.value)
    };
    
    // 验证输入
    if (Object.values(values).some(isNaN)) {
        sampleSizeOutput.textContent = '输入无效';
        return;
    }
    
    // 计算样本量
    const sampleSize = calculateSampleSize(
        values.margin,
        values.confidence,
        values.population,
        values.proportion
    );
    
    // 更新显示
    sampleSizeOutput.textContent = sampleSize;
    
    // 更新替代方案
    updateAlternativeScenarios(values);
}

// 添加事件监听器
[marginInput, confidenceInput, populationInput, proportionInput].forEach(input => {
    input.addEventListener('input', updateResults);
});

// 初始计算
updateResults(); 