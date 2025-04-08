// 飞船光标控制
const cursor = document.querySelector('.cursor');
const cursorTrail = document.querySelector('.cursor-trail');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let cursorScale = 1;
let lastMouseX = 0;
let lastMouseY = 0;
let speed = 0;
let isMoving = false;
let movingTimeout;
let trailTimer = 0;

document.addEventListener('mousemove', (e) => {
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // 计算鼠标移动速度
    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;
    speed = Math.sqrt(dx * dx + dy * dy);
    
    // 创建飞船轨迹效果
    if (speed > 3 && Date.now() - trailTimer > 100) {
        createTrailParticle();
        trailTimer = Date.now();
    }
    
    // 设置动态缩放和发光效果
    if (speed > 5) {
        cursorScale = 0.8;
        cursor.style.filter = 'drop-shadow(0 0 8px var(--accent-color))';
        isMoving = true;
        
        clearTimeout(movingTimeout);
        movingTimeout = setTimeout(() => {
            isMoving = false;
        }, 100);
    } else if (!isMoving) {
        cursorScale = 1;
        cursor.style.filter = 'drop-shadow(0 0 5px var(--accent-color))';
    }
});

// 创建轨迹粒子
function createTrailParticle() {
    const trail = document.createElement('div');
    trail.className = 'trail-particle';
    trail.style.left = cursorX + 'px';
    trail.style.top = cursorY + 'px';
    trail.style.position = 'absolute';
    trail.style.width = '8px';
    trail.style.height = '8px';
    trail.style.borderRadius = '50%';
    trail.style.background = `linear-gradient(to right, var(--accent-color), transparent)`;
    trail.style.opacity = '0.6';
    trail.style.filter = 'blur(1px)';
    trail.style.transform = 'translate(-50%, -50%)';
    trail.style.zIndex = '9998';
    trail.style.pointerEvents = 'none';
    
    cursorTrail.appendChild(trail);
    
    // 动画效果
    gsap.to(trail, {
        width: '16px',
        height: '16px',
        opacity: 0,
        duration: 1.5,
        ease: 'power1.out',
        onComplete: () => {
            trail.remove();
        }
    });
}

// 给链接添加光标悬停效果
const links = document.querySelectorAll('a');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) scale(1.2) rotate(${Math.atan2(mouseY - cursorY, mouseX - cursorX) * (180 / Math.PI)}deg)`;
        cursor.style.filter = 'drop-shadow(0 0 10px var(--accent-color))';
    });
    
    link.addEventListener('mouseleave', () => {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) scale(${cursorScale}) rotate(${Math.atan2(mouseY - cursorY, mouseX - cursorX) * (180 / Math.PI)}deg)`;
        cursor.style.filter = 'drop-shadow(0 0 5px var(--accent-color))';
    });
});

function animateCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    // 降低跟随速度，使移动更平滑
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;
    
    // 应用变换
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) scale(${cursorScale}) rotate(${Math.atan2(dy, dx) * (180 / Math.PI)}deg)`;
    
    // 添加小幅度飘动效果
    if (!isMoving) {
        const time = Date.now() / 1000;
        const floatX = Math.sin(time) * 2;
        const floatY = Math.cos(time * 0.8) * 2;
        
        cursor.style.transform = `translate(${cursorX + floatX}px, ${cursorY + floatY}px) scale(${cursorScale}) rotate(${Math.atan2(dy, dx) * (180 / Math.PI)}deg)`;
    }
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 添加滚动动画
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
}); 