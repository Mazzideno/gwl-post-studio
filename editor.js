// MazziGroup Post Editor - Core JavaScript
// Developer: Ikuyinminu Michael Mazzideno
// Contact: 08122985651 | @mazzigroup

// Global Variables
let canvas, ctx;
let currentTemplate = 'reality';
let shapes = [];
let selectedShape = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let logoImage = null;
let textFormats = {};
let textAlignments = {};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize theme
    initTheme();
    
    // Initialize canvas
    initCanvas();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    updateCanvas();
});

// Theme Toggle Functionality
function initTheme() {
    const localStorageTheme = localStorage.getItem('theme');
    const systemSettingDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    let currentTheme = 'light';
    if (localStorageTheme !== null) {
        currentTheme = localStorageTheme;
    } else if (systemSettingDark.matches) {
        currentTheme = 'dark';
    }
    
    document.querySelector('html').setAttribute('data-theme', currentTheme);
    updateThemeButton(currentTheme);
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.querySelector('html').getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.querySelector('html').setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
        updateCanvas();
    });
}

function updateThemeButton(theme) {
    const btn = document.getElementById('themeToggle');
    const textSpan = btn.querySelector('.theme-text');
    textSpan.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
}

// Canvas Initialization
function initCanvas() {
    canvas.width = 1080;
    canvas.height = 1080;
    
    // Mouse events for drag and drop
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);
}

function setupEventListeners() {
    // Color pickers
    document.getElementById('shapeColor').addEventListener('input', updateCanvas);
    document.getElementById('bgColor').addEventListener('input', updateCanvas);
    document.getElementById('accentColor').addEventListener('input', updateCanvas);
    document.getElementById('bgStyle').addEventListener('change', updateCanvas);
}

// Shape Functions
function addShape(type) {
    const color = document.getElementById('shapeColor').value;
    const shape = {
        id: Date.now(),
        type: type,
        x: 400 + Math.random() * 200,
        y: 400 + Math.random() * 200,
        width: 150,
        height: 150,
        color: color,
        draggable: true
    };
    
    shapes.push(shape);
    updateCanvas();
}

// Drawing Functions
function updateCanvas() {
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    drawBackground();
    
    // Draw shapes
    shapes.forEach(shape => drawShape(shape));
    
    // Draw logo
    if (logoImage) {
        const logoSize = parseInt(document.getElementById('logoSize').value) || 100;
        const logoX = parseInt(document.getElementById('logoX').value) || 50;
        const logoY = parseInt(document.getElementById('logoY').value) || 50;
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    }
    
    // Draw text content
    drawTextContent();
}

function drawBackground() {
    const width = canvas.width;
    const height = canvas.height;
    const bgStyle = document.getElementById('bgStyle').value;
    const bgColor = document.getElementById('bgColor').value;
    const accentColor = document.getElementById('accentColor').value;
    
    switch(bgStyle) {
        case 'solid':
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            break;
            
        case 'gradient':
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, bgColor);
            gradient.addColorStop(1, accentColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            break;
            
        case 'radial':
            const radialGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
            radialGradient.addColorStop(0, bgColor);
            radialGradient.addColorStop(1, accentColor);
            ctx.fillStyle = radialGradient;
            ctx.fillRect(0, 0, width, height);
            break;
            
        case 'geometric':
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = accentColor + '20'; // 20% opacity
            for (let i = 0; i < width; i += 100) {
                for (let j = 0; j < height; j += 100) {
                    if ((i + j) % 200 === 0) {
                        ctx.fillRect(i, j, 100, 100);
                    }
                }
            }
            break;
            
        case 'diagonal':
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = accentColor + '40'; // 40% opacity
            ctx.lineWidth = 20;
            for (let i = -width; i < width * 2; i += 100) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + height, height);
                ctx.stroke();
            }
            break;
    }
}

function drawShape(shape) {
    ctx.fillStyle = shape.color;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;
    
    switch(shape.type) {
        case 'rectangle':
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            break;
            
        case 'circle':
            ctx.beginPath();
            ctx.arc(shape.x + shape.width/2, shape.y + shape.height/2, shape.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(shape.x + shape.width/2, shape.y);
            ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
            ctx.lineTo(shape.x, shape.y + shape.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'line':
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
            ctx.stroke();
            break;
            
        case 'star':
            drawStar(shape.x + shape.width/2, shape.y + shape.height/2, 5, shape.width/2, shape.width/4);
            break;
    }
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawTextContent() {
    const width = canvas.width;
    const accentColor = document.getElementById('accentColor').value;
    
    // Template-specific styling
    const templateStyles = getTemplateStyles();
    
    // Top Label
    const topLabel = document.getElementById('topLabel').value;
    if (topLabel) {
        ctx.font = `bold 36px 'Inter', sans-serif`;
        ctx.fillStyle = templateStyles.topLabelColor || accentColor;
        ctx.textAlign = textAlignments['topLabel'] || 'center';
        ctx.fillText(topLabel.toUpperCase(), width/2, 80);
    }
    
    // Main Headline
    const mainHeadline = document.getElementById('mainHeadline').value;
    if (mainHeadline) {
        ctx.font = `bold 72px 'Inter', sans-serif`;
        ctx.fillStyle = templateStyles.headlineColor || '#0f172a';
        ctx.textAlign = textAlignments['mainHeadline'] || 'center';
        wrapText(mainHeadline, width/2, 180, width - 100, 90);
    }
    
    // Highlighted Phrase
    const highlightedPhrase = document.getElementById('highlightedPhrase').value;
    if (highlightedPhrase) {
        const textX = width/2;
        const textY = 350;
        
        // Draw highlight background
        ctx.font = `bold 48px 'Inter', sans-serif`;
        const textWidth = ctx.measureText(highlightedPhrase).width;
        ctx.fillStyle = accentColor + '30';
        ctx.fillRect(textX - textWidth/2 - 20, textY - 60, textWidth + 40, 80);
        
        // Draw text
        ctx.fillStyle = templateStyles.highlightColor || accentColor;
        ctx.textAlign = textAlignments['highlightedPhrase'] || 'center';
        ctx.fillText(highlightedPhrase, textX, textY);
    }
    
    // Body Text
    const bodyText = document.getElementById('bodyText').value;
    if (bodyText) {
        ctx.font = `400 36px 'Inter', sans-serif`;
        ctx.fillStyle = templateStyles.bodyColor || '#475569';
        ctx.textAlign = textAlignments['bodyText'] || 'center';
        wrapText(bodyText, width/2, 480, width - 100, 50);
    }
    
    // Call to Action
    const ctaText = document.getElementById('ctaText').value;
    if (ctaText) {
        ctx.font = `bold 42px 'Inter', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = textAlignments['ctaText'] || 'center';
        
        // Draw CTA button background
        const textWidth = ctx.measureText(ctaText).width;
        const buttonWidth = textWidth + 80;
        const buttonHeight = 80;
        const buttonX = width/2 - buttonWidth/2;
        const buttonY = 650;
        
        // Rounded rectangle for CTA
        roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 15, accentColor, true);
        
        // Draw CTA text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(ctaText.toUpperCase(), width/2, buttonY + 50);
    }
    
    // Footer
    ctx.font = `300 28px 'Inter', sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('Built by MazziGroup', width/2, height - 40);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
}

function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    
    for (let k = 0; k < lines.length; k++) {
        ctx.fillText(lines[k], x, y + k * lineHeight);
    }
}

function getTemplateStyles() {
    const accentColor = document.getElementById('accentColor').value;
    
    const styles = {
        reality: {
            topLabelColor: '#ef4444',
            headlineColor: '#0f172a',
            highlightColor: accentColor,
            bodyColor: '#475569'
        },
        bold: {
            topLabelColor: accentColor,
            headlineColor: '#0f172a',
            highlightColor: '#f59e0b',
            bodyColor: '#475569'
        },
        myth: {
            topLabelColor: '#64748b',
            headlineColor: '#0f172a',
            highlightColor: '#10b981',
            bodyColor: '#475569'
        },
        fact: {
            topLabelColor: '#3b82f6',
            headlineColor: '#0f172a',
            highlightColor: accentColor,
            bodyColor: '#475569'
        },
        culture: {
            topLabelColor: '#8b5cf6',
            headlineColor: '#0f172a',
            highlightColor: '#ec4899',
            bodyColor: '#475569'
        },
        announce: {
            topLabelColor: '#f59e0b',
            headlineColor: '#0f172a',
            highlightColor: accentColor,
            bodyColor: '#475569'
        }
    };
    
    return styles[currentTemplate] || styles.reality;
}

// Text Formatting Functions
function formatText(elementId, format) {
    const element = document.getElementById(elementId);
    let text = element.value;
    
    switch(format) {
        case 'upper':
            text = text.toUpperCase();
            break;
        case 'lower':
            text = text.toLowerCase();
            break;
        case 'title':
            text = text.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            break;
    }
    
    element.value = text;
    textFormats[elementId] = format;
    updateCanvas();
}

function setAlignment(elementId, alignment) {
    textAlignments[elementId] = alignment;
    updateCanvas();
}

// Template Functions
function setTemplate(template) {
    currentTemplate = template;
    
    // Update active button
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-template="${template}"]`).classList.add('active');
    
    updateCanvas();
}

// Canvas Size Functions
function changeCanvasSize() {
    const sizeSelect = document.getElementById('canvasSize');
    const [width, height] = sizeSelect.value.split('x').map(Number);
    
    canvas.width = width;
    canvas.height = height;
    
    updateCanvas();
}

// Logo Upload
function uploadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoImage = new Image();
            logoImage.onload = function() {
                document.getElementById('logoControls').style.display = 'block';
                updateCanvas();
            };
            logoImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Mouse Event Handlers
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if clicking on a shape
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (mouseX >= shape.x && mouseX <= shape.x + shape.width &&
            mouseY >= shape.y && mouseY <= shape.y + shape.height) {
            selectedShape = shape;
            isDragging = true;
            dragOffset.x = mouseX - shape.x;
            dragOffset.y = mouseY - shape.y;
            break;
        }
    }
}

function handleMouseMove(e) {
    if (!isDragging || !selectedShape) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    selectedShape.x = mouseX - dragOffset.x;
    selectedShape.y = mouseY - dragOffset.y;
    
    updateCanvas();
}

function handleMouseUp() {
    isDragging = false;
    selectedShape = null;
}

// Export Functions
function exportPost() {
    downloadPNG();
}

function downloadPNG() {
    const link = document.createElement('a');
    link.download = `mazzigroup-post-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadJPG() {
    const link = document.createElement('a');
    link.download = `mazzigroup-post-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
}

function copyCaption() {
    const headline = document.getElementById('mainHeadline').value;
    const body = document.getElementById('bodyText').value;
    const cta = document.getElementById('ctaText').value;
    
    const caption = `${headline}\n\n${body}\n\n${cta}\n\n#MazziGroup #Design`;
    
    navigator.clipboard.writeText(caption).then(() => {
        alert('Caption copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto-save functionality
const autoSave = debounce(() => {
    const formData = {
        topLabel: document.getElementById('topLabel').value,
        mainHeadline: document.getElementById('mainHeadline').value,
        highlightedPhrase: document.getElementById('highlightedPhrase').value,
        bodyText: document.getElementById('bodyText').value,
        ctaText: document.getElementById('ctaText').value,
        template: currentTemplate,
        canvasSize: document.getElementById('canvasSize').value
    };
    localStorage.setItem('mazzigroup_editor_data', JSON.stringify(formData));
}, 1000);

// Load saved data on page load
window.addEventListener('load', () => {
    const savedData = localStorage.getItem('mazzigroup_editor_data');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('topLabel').value = data.topLabel || '';
        document.getElementById('mainHeadline').value = data.mainHeadline || '';
        document.getElementById('highlightedPhrase').value = data.highlightedPhrase || '';
        document.getElementById('bodyText').value = data.bodyText || '';
        document.getElementById('ctaText').value = data.ctaText || '';
        
        if (data.template) {
            setTemplate(data.template);
        }
        if (data.canvasSize) {
            document.getElementById('canvasSize').value = data.canvasSize;
        }
    }
    
    // Add auto-save listeners
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', autoSave);
    });
});

console.log(' MazziGroup Post Editor Loaded Successfully!');
console.log('Developer: Ikuyinminu Michael Mazzideno');
console.log('Contact: 08122985651 | @mazzigroup');
console.log('© 2026 MazziGroup. All Rights Reserved.');