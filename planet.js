// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    initPlanet();
});

function initPlanet() {
    console.log("初始化星球...");
    
    // 获取容器元素
    const container = document.getElementById('planet-container');
    if (!container) {
        console.error("找不到星球容器元素");
        return;
    }
    
    console.log("容器尺寸:", container.clientWidth, container.clientHeight);
    
    // 初始化 Three.js 场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // 创建渲染器，设置透明背景
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    
    // 设置渲染器尺寸
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // 创建海洋球体 - 使用深蓝色
    const oceanGeometry = new THREE.SphereGeometry(2, 64, 64);
    const oceanMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be, // 深蓝色海洋
        shininess: 100,
        specular: 0x111111
    });
    
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    scene.add(ocean);
    
    // 创建陆地地形
    const landGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // 创建噪声地形
    createTerrainNoise(landGeometry);
    
    // 陆地材质
    const landMaterial = new THREE.MeshPhongMaterial({
        color: 0x2e8b57, // 海绿色
        shininess: 5,
        transparent: true,
        opacity: 1,
        alphaMap: createContinentMap(), // 使用自定义大陆分布图
        alphaTest: 0.5
    });
    
    const land = new THREE.Mesh(landGeometry, landMaterial);
    land.scale.set(1.01, 1.01, 1.01); // 稍微大于海洋
    scene.add(land);
    
    // 添加环境光和方向光
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // 调整相机位置
    camera.position.z = 6;
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 缓慢旋转
        ocean.rotation.y += 0.001;
        land.rotation.y += 0.001;
        
        renderer.render(scene, camera);
    }
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // 创建地形起伏
    function createTerrainNoise(geometry) {
        const vertices = geometry.attributes.position;
        const count = vertices.count;
        
        // 柏林噪声种子
        const seed = Math.random() * 100;
        
        // 为每个顶点添加高度变化
        for (let i = 0; i < count; i++) {
            const x = vertices.getX(i);
            const y = vertices.getY(i);
            const z = vertices.getZ(i);
            
            // 计算球面坐标
            const radius = Math.sqrt(x*x + y*y + z*z);
            const theta = Math.atan2(z, x); // 经度
            const phi = Math.acos(y / radius); // 纬度
            
            // 简单噪声函数，可以用更复杂的柏林噪声替代
            const noise = (Math.sin(theta * 5 + seed) * Math.cos(phi * 5 + seed) * 0.05) +
                         (Math.sin(theta * 10 + seed) * Math.cos(phi * 10 + seed) * 0.025);
            
            // 添加起伏，并确保陆地比海洋高
            const elevation = 1 + noise;
            
            // 更新顶点位置
            vertices.setX(i, x * elevation);
            vertices.setY(i, y * elevation);
            vertices.setZ(i, z * elevation);
        }
        
        vertices.needsUpdate = true;
        geometry.computeVertexNormals(); // 重新计算法线
    }
    
    // 创建大陆分布图
    function createContinentMap() {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 填充黑色背景
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        
        // 使用多个噪声层创建逼真的大陆
        const noiseMap = generateNoiseMap(size, size);
        
        // 应用噪声图
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // 计数器，用于确保50%的分布
        let landCount = 0;
        const totalPixels = size * size;
        
        // 第一遍：检查陆地像素数量
        for (let i = 0; i < totalPixels; i++) {
            if (noiseMap[i] > 0.5) { // 暂时使用0.5作为阈值
                landCount++;
            }
        }
        
        // 调整阈值使陆地约占50%
        const targetRatio = 0.5; // 目标比例：50%
        const currentRatio = landCount / totalPixels;
        let threshold = 0.5;
        
        if (currentRatio > targetRatio) {
            // 如果陆地太多，提高阈值
            threshold = 0.5 + (currentRatio - targetRatio);
        } else if (currentRatio < targetRatio) {
            // 如果陆地太少，降低阈值
            threshold = 0.5 - (targetRatio - currentRatio);
        }
        
        // 应用调整后的阈值
        for (let i = 0; i < totalPixels; i++) {
            const index = i * 4;
            const value = noiseMap[i] > threshold ? 255 : 0;
            
            // RGB全设为255，Alpha通道根据地形设置
            data[index] = data[index + 1] = data[index + 2] = 255;
            data[index + 3] = value;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // 创建纹理
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    // 生成噪声地图
    function generateNoiseMap(width, height) {
        const map = new Array(width * height);
        
        // 多个频率的正弦波模拟噪声
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const u = x / width;
                const v = y / height;
                
                // 将UV坐标转换为球面坐标
                const theta = u * Math.PI * 2; // 经度 0-2PI
                const phi = v * Math.PI; // 纬度 0-PI
                
                // 多层噪声
                let noise = 0;
                noise += 0.5 * (Math.sin(5 * theta) * Math.cos(5 * phi));
                noise += 0.25 * (Math.sin(10 * theta) * Math.cos(10 * phi));
                noise += 0.125 * (Math.sin(20 * theta) * Math.cos(20 * phi));
                
                // 归一化到0-1
                noise = (noise + 1) * 0.5;
                
                // 分形处理，增加细节
                noise = Math.pow(noise, 1.2);
                
                map[y * width + x] = noise;
            }
        }
        
        return map;
    }
    
    // 开始动画
    animate();
    
    console.log("星球初始化完成");
} 