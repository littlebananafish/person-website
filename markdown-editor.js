// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // 初始化Markdown编辑器
    initMarkdownEditor();
});

function initMarkdownEditor() {
    const markdownInput = document.getElementById('markdown-input');
    const markdownPreview = document.getElementById('markdown-preview');
    
    // 加载示例内容
    const sampleMarkdown = `# Markdown编辑器示例

这是一个**简单易用**的在线Markdown编辑器。

## 功能特点

- 实时预览
- 简单易用
- 支持常用Markdown语法
- 支持导出HTML和Markdown文件

## 示例代码

\`\`\`javascript
function hello() {
    console.log("Hello, Markdown!");
}
\`\`\`

## 表格示例

| 项目 | 价格 | 数量 |
|------|------|------|
| 苹果 | ¥5   | 10   |
| 香蕉 | ¥3   | 5    |

更多Markdown语法请参考下方的Markdown快速指南。
`;
    
    markdownInput.value = sampleMarkdown;
    
    // 初始渲染
    renderMarkdown();
    
    // 监听输入变化，实时渲染预览
    markdownInput.addEventListener('input', renderMarkdown);
    
    // 工具栏按钮事件
    document.getElementById('btn-bold').addEventListener('click', () => insertMarkdown('**', '**', '粗体文本'));
    document.getElementById('btn-italic').addEventListener('click', () => insertMarkdown('*', '*', '斜体文本'));
    document.getElementById('btn-heading').addEventListener('click', () => insertMarkdown('## ', '', '标题'));
    document.getElementById('btn-link').addEventListener('click', () => insertMarkdown('[', '](https://example.com)', '链接文本'));
    document.getElementById('btn-image').addEventListener('click', () => insertMarkdown('![', '](https://example.com/image.jpg)', '图片描述'));
    document.getElementById('btn-list').addEventListener('click', () => insertMarkdown('- ', '', '列表项'));
    document.getElementById('btn-code').addEventListener('click', () => insertMarkdown('```\n', '\n```', '代码块'));
    
    // 操作按钮事件
    document.getElementById('btn-copy').addEventListener('click', copyHTML);
    document.getElementById('btn-download-md').addEventListener('click', downloadMarkdown);
    document.getElementById('btn-download-html').addEventListener('click', downloadHTML);
    document.getElementById('btn-clear').addEventListener('click', clearEditor);
    
    // 快捷键支持
    markdownInput.addEventListener('keydown', handleShortcuts);
}

// 渲染Markdown为HTML
function renderMarkdown() {
    const markdownInput = document.getElementById('markdown-input');
    const markdownPreview = document.getElementById('markdown-preview');
    
    // 使用简单的Markdown解析器
    // 这里使用简化版，实际项目中可以使用成熟的库如marked.js
    const html = parseMarkdown(markdownInput.value);
    markdownPreview.innerHTML = html;
}

// 简单的Markdown解析函数
function parseMarkdown(markdown) {
    // 处理代码块
    markdown = markdown.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    
    // 处理行内代码
    markdown = markdown.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 处理标题
    markdown = markdown.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    markdown = markdown.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    markdown = markdown.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    markdown = markdown.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    markdown = markdown.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    markdown = markdown.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    
    // 处理粗体
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 处理链接
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // 处理图片
    markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2">');
    
    // 处理无序列表
    markdown = markdown.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
    markdown = markdown.replace(/(<li>.*<\/li>)\s*(<li>)/g, '$1<li>');
    markdown = markdown.replace(/(<li>.*<\/li>)/, '<ul>$1</ul>');
    
    // 处理有序列表
    markdown = markdown.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
    
    // 处理引用
    markdown = markdown.replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // 处理水平线
    markdown = markdown.replace(/^---$/gm, '<hr>');
    
    // 处理段落
    markdown = markdown.replace(/^(?!<[a-z])/gm, '<p>');
    markdown = markdown.replace(/^<p>(.*?)$/gm, function(match, p1) {
        return p1.trim() === '' ? '' : match;
    });
    markdown = markdown.replace(/^(.*?)$/gm, function(match, p1) {
        if (p1.trim() === '' || p1.startsWith('<')) {
            return p1;
        }
        return p1 + '</p>';
    });
    
    return markdown;
}

// 在光标位置插入Markdown语法
function insertMarkdown(before, after, placeholder) {
    const markdownInput = document.getElementById('markdown-input');
    const start = markdownInput.selectionStart;
    const end = markdownInput.selectionEnd;
    const text = markdownInput.value;
    const selectedText = text.substring(start, end) || placeholder;
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    markdownInput.value = newText;
    
    // 重新设置光标位置
    const newCursorPos = start + before.length + selectedText.length;
    markdownInput.focus();
    markdownInput.setSelectionRange(newCursorPos, newCursorPos);
    
    // 更新预览
    renderMarkdown();
}

// 复制HTML
function copyHTML() {
    const markdownPreview = document.getElementById('markdown-preview');
    const html = markdownPreview.innerHTML;
    
    navigator.clipboard.writeText(html).then(() => {
        alert('HTML已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}

// 下载Markdown文件
function downloadMarkdown() {
    const markdownInput = document.getElementById('markdown-input');
    const markdown = markdownInput.value;
    
    downloadFile('markdown.md', markdown, 'text/markdown');
}

// 下载HTML文件
function downloadHTML() {
    const markdownPreview = document.getElementById('markdown-preview');
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown导出</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        img { max-width: 100%; }
        pre { background-color: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; }
        code { background-color: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
        pre code { background-color: transparent; padding: 0; }
        blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #666; }
    </style>
</head>
<body>
    ${markdownPreview.innerHTML}
</body>
</html>`;
    
    downloadFile('markdown.html', html, 'text/html');
}

// 下载文件通用函数
function downloadFile(filename, content, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}

// 清空编辑器
function clearEditor() {
    if (confirm('确定要清空编辑器内容吗？此操作不可撤销。')) {
        document.getElementById('markdown-input').value = '';
        renderMarkdown();
    }
}

// 处理快捷键
function handleShortcuts(e) {
    // Ctrl+B: 粗体
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**', '**', '粗体文本');
    }
    
    // Ctrl+I: 斜体
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*', '*', '斜体文本');
    }
    
    // Ctrl+K: 链接
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        insertMarkdown('[', '](https://example.com)', '链接文本');
    }
    
    // Ctrl+H: 标题
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        insertMarkdown('## ', '', '标题');
    }
} 