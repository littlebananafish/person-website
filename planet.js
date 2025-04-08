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
    
    // 计算视口尺寸和相机参数
    const windowWidth = container.clientWidth;
    const windowHeight = container.clientHeight;
    const minDimension = Math.min(windowWidth, windowHeight);
    
    // 根据视口大小调整星球大小
    const planetSize = minDimension * 0.25; // 调整为视口最小边的25%
    
    const camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 0.1, 1000);
    
    // 创建渲染器，设置透明背景
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    
    // 设置渲染器尺寸和像素比
    renderer.setSize(windowWidth, windowHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // 创建海洋球体 - 深蓝色
    const radius = 1.0; // 基础半径，实际大小会通过相机位置控制
    const oceanGeometry = new THREE.SphereGeometry(radius, 96, 96); // 增加精度
    const oceanMaterial = new THREE.MeshPhongMaterial({
        color: 0x006994, // 稍深的蓝色
        shininess: 60,
        specular: 0x333333
    });
    
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    scene.add(ocean);
    
    // 创建陆地地形
    const landGeometry = new THREE.SphereGeometry(radius, 96, 96); // 与海洋相同的基础半径
    
    // 创建带有更多细节的地形
    createTerrainNoise(landGeometry);
    
    // 陆地材质 - 使用更自然的绿色
    const landMaterial = new THREE.MeshPhongMaterial({
        color: 0x3d8c40, // 自然绿色
        shininess: 10,
        transparent: true,
        opacity: 1,
        alphaMap: createContinentMap(),
        alphaTest: 0.5
    });
    
    const land = new THREE.Mesh(landGeometry, landMaterial);
    land.scale.set(1.01, 1.01, 1.01); // 陆地略微大于海洋
    scene.add(land);
    
    // 添加大气层光晕效果
    const glowGeometry = new THREE.SphereGeometry(radius * 1.02, 32, 32);
    const glowMaterial = new THREE.MeshPhongMaterial({
        color: 0x6699ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x555555); // 增强环境光
    scene.add(ambientLight);
    
    // 添加方向光模拟太阳光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 2, 5); // 调整光照角度
    scene.add(directionalLight);
    
    // 设置相机位置 - 根据计算的星球大小调整
    camera.position.z = 4;
    
    // 倾斜星球以模拟地轴倾角
    ocean.rotation.x = land.rotation.x = glow.rotation.x = Math.PI * 0.1;
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 同步旋转所有层
        const rotationSpeed = 0.0005; // 减慢旋转速度
        ocean.rotation.y += rotationSpeed;
        land.rotation.y += rotationSpeed;
        glow.rotation.y += rotationSpeed;
        
        renderer.render(scene, camera);
    }
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
        // 更新相机和渲染器
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
    
    // 创建地形起伏 - 增强效果
    function createTerrainNoise(geometry) {
        const vertices = geometry.attributes.position;
        const count = vertices.count;
        
        // 使用种子确保每次生成相同的地形
        const seed = 123.456;
        
        // 为每个顶点添加高度变化
        for (let i = 0; i < count; i++) {
            const x = vertices.getX(i);
            const y = vertices.getY(i);
            const z = vertices.getZ(i);
            
            // 计算球面坐标
            const radius = Math.sqrt(x*x + y*y + z*z);
            const theta = Math.atan2(z, x); // 经度
            const phi = Math.acos(y / radius); // 纬度
            
            // 使用多层叠加的噪声创建更自然的地形
            let noise = 0;
            // 大型地形特征
            noise += 0.04 * Math.sin(theta * 4 + seed) * Math.cos(phi * 4 + seed); 
            // 中型地形特征
            noise += 0.02 * Math.sin(theta * 8 + seed * 2) * Math.cos(phi * 8 + seed * 2);
            // 小型地形特征
            noise += 0.01 * Math.sin(theta * 16 + seed * 3) * Math.cos(phi * 16 + seed * 3);
            
            // 应用高度变化
            const elevation = 1 + noise;
            
            vertices.setX(i, x * elevation);
            vertices.setY(i, y * elevation);
            vertices.setZ(i, z * elevation);
        }
        
        vertices.needsUpdate = true;
        geometry.computeVertexNormals(); // 重新计算法线
    }
    
    // 创建大陆分布图 - 使用固定种子以保持一致性
    function createContinentMap() {
        const size = 2048; // 增加贴图分辨率
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 填充黑色背景
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        
        // 使用固定种子生成相似的地球形状
        const noiseMap = generateNoiseMap(size, size, 123.456);
        
        // 应用噪声图
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // 计数器，用于确保50%的分布
        let landCount = 0;
        const totalPixels = size * size;
        
        // 第一遍：检查陆地像素数量
        for (let i = 0; i < totalPixels; i++) {
            if (noiseMap[i] > 0.5) {
                landCount++;
            }
        }
        
        // 调整阈值使陆地约占50%
        const targetRatio = 0.5;
        const currentRatio = landCount / totalPixels;
        let threshold = 0.5;
        
        if (currentRatio > targetRatio) {
            threshold = 0.5 + (currentRatio - targetRatio) * 0.5;
        } else if (currentRatio < targetRatio) {
            threshold = 0.5 - (targetRatio - currentRatio) * 0.5;
        }
        
        // 应用平滑过渡的陆地边界
        for (let i = 0; i < totalPixels; i++) {
            const index = i * 4;
            
            // 创建平滑过渡
            const noiseValue = noiseMap[i];
            const distFromThreshold = Math.abs(noiseValue - threshold);
            const edgeFactor = Math.min(distFromThreshold * 10, 1); // 边缘平滑因子
            
            // 如果超过阈值，则为陆地
            let value = 0;
            if (noiseValue > threshold) {
                value = 255 * edgeFactor; // 陆地边缘平滑过渡
            }
            
            // RGB设为白色，Alpha通道用于控制陆地
            data[index] = data[index + 1] = data[index + 2] = 255;
            data[index + 3] = value;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // 创建纹理并添加模糊效果模拟地形边界过渡
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        return texture;
    }
    
    // 生成噪声地图 - 使用更自然的地形分布算法
    function generateNoiseMap(width, height, seed) {
        const map = new Array(width * height);
        
        // 多个频率的正弦波模拟噪声 - 使用固定种子
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const u = x / width;
                const v = y / height;
                
                // 将UV坐标转换为球面坐标
                const theta = u * Math.PI * 2; // 经度 0-2PI
                const phi = v * Math.PI; // 纬度 0-PI
                
                // 模拟类似地球的大陆分布
                let noise = 0;
                
                // 添加大陆偏移，模拟七大洲的大致位置
                const longitudeOffset = Math.sin(theta * 3 + seed) * 0.2;
                const latitudeWeight = Math.sin(phi - Math.PI/2) * 0.3 + 0.5; // 纬度加权，使陆地更集中在中纬度
                
                // 添加噪声层
                noise += 0.6 * (Math.sin((theta + longitudeOffset) * 4 + seed) * Math.cos(phi * 3 + seed));
                noise += 0.3 * (Math.sin((theta + longitudeOffset) * 8 + seed * 2) * Math.cos(phi * 6 + seed * 2));
                noise += 0.1 * (Math.sin((theta + longitudeOffset) * 16 + seed * 3) * Math.cos(phi * 12 + seed * 3));
                
                // 应用纬度加权
                noise = noise * latitudeWeight;
                
                // 归一化到0-1范围
                noise = (noise + 0.6) * 0.5;
                
                // 增加对比度，使大陆边界更清晰
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