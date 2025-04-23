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
    document.getElementById('btn-ordered-list').addEventListener('click', () => insertMarkdown('1. ', '', '列表项'));
    document.getElementById('btn-table').addEventListener('click', () => insertTable());
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

// 插入表格模板
function insertTable() {
    const tableTemplate = 
`| 标题1 | 标题2 | 标题3 |
|-------|-------|-------|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |`;
    
    insertMarkdown(tableTemplate, '', '');
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
    
    // 处理表格
    markdown = processTable(markdown);
    
    // 处理无序列表
    markdown = processUnorderedList(markdown);
    
    // 处理有序列表
    markdown = processOrderedList(markdown);
    
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

// 处理无序列表的辅助函数
function processUnorderedList(markdown) {
    // 找到所有无序列表项
    const listItemRegex = /^\s*- (.*$)/gm;
    let listItems = [];
    let match;
    
    while ((match = listItemRegex.exec(markdown)) !== null) {
        listItems.push({
            index: match.index,
            length: match[0].length,
            content: match[1],
            replaced: false
        });
    }
    
    if (listItems.length === 0) return markdown;
    
    // 按索引排序以确保正确的替换顺序
    listItems.sort((a, b) => b.index - a.index);
    
    // 检测连续的列表项并进行分组
    let currentGroup = [listItems[0]];
    let groups = [currentGroup];
    
    for (let i = 1; i < listItems.length; i++) {
        const prevItem = listItems[i - 1];
        const currentItem = listItems[i];
        
        // 检查两个列表项之间是否只有空行或没有内容
        const textBetween = markdown.substring(
            currentItem.index + currentItem.length,
            prevItem.index
        ).trim();
        
        if (textBetween === '') {
            // 属于同一组
            currentGroup.push(currentItem);
        } else {
            // 开始新分组
            currentGroup = [currentItem];
            groups.push(currentGroup);
        }
    }
    
    // 为每个分组创建一个<ul>...</ul>
    for (const group of groups) {
        // 按原始顺序排序
        group.sort((a, b) => a.index - b.index);
        
        // 创建HTML
        let html = '<ul>';
        for (const item of group) {
            html += `<li>${item.content}</li>`;
            item.replaced = true;
        }
        html += '</ul>';
        
        // 替换第一个列表项的全部内容
        const firstItem = group[0];
        const lastItem = group[group.length - 1];
        const startPos = firstItem.index;
        const endPos = lastItem.index + lastItem.length;
        const originalText = markdown.substring(startPos, endPos);
        
        markdown = markdown.substring(0, startPos) + html + markdown.substring(endPos);
        
        // 调整后续项的索引
        const lengthDiff = html.length - originalText.length;
        for (let i = 0; i < listItems.length; i++) {
            if (!listItems[i].replaced && listItems[i].index > startPos) {
                listItems[i].index += lengthDiff;
            }
        }
    }
    
    return markdown;
}

// 处理有序列表的辅助函数
function processOrderedList(markdown) {
    // 找到所有有序列表项
    const listItemRegex = /^\s*\d+\. (.*$)/gm;
    let listItems = [];
    let match;
    
    while ((match = listItemRegex.exec(markdown)) !== null) {
        listItems.push({
            index: match.index,
            length: match[0].length,
            content: match[1],
            replaced: false
        });
    }
    
    if (listItems.length === 0) return markdown;
    
    // 按索引排序以确保正确的替换顺序
    listItems.sort((a, b) => b.index - a.index);
    
    // 检测连续的列表项并进行分组
    let currentGroup = [listItems[0]];
    let groups = [currentGroup];
    
    for (let i = 1; i < listItems.length; i++) {
        const prevItem = listItems[i - 1];
        const currentItem = listItems[i];
        
        // 检查两个列表项之间是否只有空行或没有内容
        const textBetween = markdown.substring(
            currentItem.index + currentItem.length,
            prevItem.index
        ).trim();
        
        if (textBetween === '') {
            // 属于同一组
            currentGroup.push(currentItem);
        } else {
            // 开始新分组
            currentGroup = [currentItem];
            groups.push(currentGroup);
        }
    }
    
    // 为每个分组创建一个<ol>...</ol>
    for (const group of groups) {
        // 按原始顺序排序
        group.sort((a, b) => a.index - b.index);
        
        // 创建HTML
        let html = '<ol>';
        for (const item of group) {
            html += `<li>${item.content}</li>`;
            item.replaced = true;
        }
        html += '</ol>';
        
        // 替换第一个列表项的全部内容
        const firstItem = group[0];
        const lastItem = group[group.length - 1];
        const startPos = firstItem.index;
        const endPos = lastItem.index + lastItem.length;
        const originalText = markdown.substring(startPos, endPos);
        
        markdown = markdown.substring(0, startPos) + html + markdown.substring(endPos);
        
        // 调整后续项的索引
        const lengthDiff = html.length - originalText.length;
        for (let i = 0; i < listItems.length; i++) {
            if (!listItems[i].replaced && listItems[i].index > startPos) {
                listItems[i].index += lengthDiff;
            }
        }
    }
    
    return markdown;
}

// 处理表格的辅助函数
function processTable(markdown) {
    // 表格的正则表达式模式：至少需要表头行、分隔行和一个数据行
    const tableRegex = /^\|(.*)\|\s*\n\|([-:\|\s]*)\|\s*\n(\|.*\|\s*\n?)+/gm;
    
    return markdown.replace(tableRegex, function(table) {
        // 分割表格行
        const rows = table.trim().split('\n');
        
        if (rows.length < 3) return table; // 至少需要表头、分隔行和一个数据行
        
        let html = '<table><thead><tr>';
        
        // 处理表头
        const headers = rows[0].split('|').filter(cell => cell.trim() !== '');
        for (const header of headers) {
            html += `<th>${header.trim()}</th>`;
        }
        
        html += '</tr></thead><tbody>';
        
        // 跳过第一行（表头）和第二行（分隔行）
        for (let i = 2; i < rows.length; i++) {
            const row = rows[i];
            if (row.trim() === '') continue;
            
            html += '<tr>';
            const cells = row.split('|').filter(cell => cell.trim() !== '');
            
            for (const cell of cells) {
                html += `<td>${cell.trim()}</td>`;
            }
            
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        return html;
    });
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