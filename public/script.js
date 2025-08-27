const canvas = document.getElementById('plot');
const ctx = canvas.getContext('2d');
const targetInfo = document.getElementById('target-info');
const feedback = document.getElementById('feedback');
const checkBtn = document.getElementById('check');
const scoreEl = document.getElementById('score');
const attemptsEl = document.getElementById('attempts');
// ...existing code...

const size = 400;
const margin = 40;
const axisMin = -10;
const axisMax = 10;
let target = { x: 0, y: 0 };
let dotCoord = { x: 0, y: 0 }; // axis coordinates
let dragging = false;
let score = 0;
let attempts = 0;
let canCheck = true;

function axisToCanvas(x, y) {
    // Convert axis (-10 to 10) to canvas coordinates
    return {
        x: margin + (x - axisMin) * (size - 2 * margin) / (axisMax - axisMin),
        y: size - margin - (y - axisMin) * (size - 2 * margin) / (axisMax - axisMin)
    };
}
function canvasToAxis(x, y) {
    // Convert canvas coordinates to axis coordinates
    return {
        x: Math.round((x - margin) * (axisMax - axisMin) / (size - 2 * margin) + axisMin),
        y: Math.round((size - margin - y) * (axisMax - axisMin) / (size - 2 * margin) + axisMin)
    };
}

function randomTarget() {
    target.x = Math.floor(Math.random() * 21) - 10;
    target.y = Math.floor(Math.random() * 21) - 10;
    dotCoord = { x: 0, y: 0 };
    canCheck = true;
    draw();
    feedback.textContent = '';
    targetInfo.textContent = `Move the dot to: (${target.x}, ${target.y})`;
    checkBtn.disabled = false;
    // Easter egg logic
    const eggDiv = document.getElementById('easter-egg');
    eggDiv.innerHTML = '';
    if ((Math.abs(target.x) === 6 && Math.abs(target.y) === 7)) {
        eggDiv.innerHTML = '<img src="https://www.dole.com/sites/default/files/styles/1024w768h-80/public/media/2025-01/mangos.png?itok=pS1eZJtK-r6z70DGP" alt="Mango" style="height:60px;border-radius:12px;margin:4px;box-shadow:0 2px 8px #a77ff7;">' +
            '<img src="https://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/f_auto/q_auto/r_8/c_limit,w_3840/f_auto/q_auto/v1/dxp-images/heinz/products/00057000036355-yellow-mustard/marketing-view-color-front_content-hub-7898708_fb489b1cf1a7c22fb14246c55f848349?_a=BAVAfVDW0" alt="Mustard" style="height:60px;border-radius:12px;margin:4px;box-shadow:0 2px 8px #a77ff7;">';
    }
}

function draw(confetti = false) {
    ctx.clearRect(0, 0, size, size);
    // Draw grid
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = axisMin; i <= axisMax; i++) {
        let pos = axisToCanvas(i, axisMin);
        ctx.beginPath();
        ctx.moveTo(pos.x, margin);
        ctx.lineTo(pos.x, size - margin);
        ctx.stroke();
        pos = axisToCanvas(axisMin, i);
        ctx.beginPath();
        ctx.moveTo(margin, pos.y);
        ctx.lineTo(size - margin, pos.y);
        ctx.stroke();
    }
    // Draw axes as a plus symbol at (0,0)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    // Vertical axis (Y)
    const zeroX = axisToCanvas(0, axisMin).x;
    ctx.beginPath();
    ctx.moveTo(zeroX, margin);
    ctx.lineTo(zeroX, size - margin);
    ctx.stroke();
    // Horizontal axis (X)
    const zeroY = axisToCanvas(axisMin, 0).y;
    ctx.beginPath();
    ctx.moveTo(margin, zeroY);
    ctx.lineTo(size - margin, zeroY);
    ctx.stroke();
    // Draw numbers on axes
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = axisMin; i <= axisMax; i++) {
        // X axis numbers
        if (i !== 0) {
            let pos = axisToCanvas(i, 0);
            ctx.fillText(i, pos.x, zeroY + 16);
        }
        // Y axis numbers
        if (i !== 0) {
            let pos = axisToCanvas(0, i);
            ctx.fillText(i, zeroX - 16, pos.y);
        }
    }
    // Draw draggable dot
    const dotCanvas = axisToCanvas(dotCoord.x, dotCoord.y);
    ctx.fillStyle = '#0077ff';
    ctx.beginPath();
    ctx.arc(dotCanvas.x, dotCanvas.y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#0055aa';
    ctx.stroke();
    // Cool effect: confetti burst
    if (confetti) {
        for (let i = 0; i < 30; i++) {
            ctx.save();
            ctx.translate(dotCanvas.x, dotCanvas.y);
            ctx.rotate(Math.random() * 2 * Math.PI);
            ctx.fillStyle = `hsl(${Math.random()*360},80%,60%)`;
            ctx.fillRect(0, 0, 6, 2);
            ctx.restore();
        }
    }
}

canvas.addEventListener('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dotCanvas = axisToCanvas(dotCoord.x, dotCoord.y);
    if (Math.hypot(mx - dotCanvas.x, my - dotCanvas.y) < 15) {
        dragging = true;
    } else {
        // If not dragging, treat as click-to-place
        // Clamp to plot area
        let mxClamped = Math.max(margin, Math.min(size - margin, mx));
        let myClamped = Math.max(margin, Math.min(size - margin, my));
        const snapped = canvasToAxis(mxClamped, myClamped);
        dotCoord.x = Math.max(axisMin, Math.min(axisMax, snapped.x));
        dotCoord.y = Math.max(axisMin, Math.min(axisMax, snapped.y));
        draw();
    }
});
canvas.addEventListener('mousemove', function(e) {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        let mx = e.clientX - rect.left;
        let my = e.clientY - rect.top;
        // Clamp to plot area
        mx = Math.max(margin, Math.min(size - margin, mx));
        my = Math.max(margin, Math.min(size - margin, my));
        // Snap to nearest integer axis coordinate
        const snapped = canvasToAxis(mx, my);
        dotCoord.x = Math.max(axisMin, Math.min(axisMax, snapped.x));
        dotCoord.y = Math.max(axisMin, Math.min(axisMax, snapped.y));
        draw();
    }
});
canvas.addEventListener('mouseup', function(e) {
    dragging = false;
});
canvas.addEventListener('mouseleave', function(e) {
    dragging = false;
});

checkBtn.addEventListener('click', () => {
    if (!canCheck) return;
    attempts++;
    attemptsEl.textContent = `Attempts: ${attempts}`;
    if (dotCoord.x === target.x && dotCoord.y === target.y) {
        feedback.textContent = 'Correct!';
        feedback.style.color = '#007700';
        draw(true);
        score++;
        scoreEl.textContent = `Score: ${score}`;
        canCheck = false;
        checkBtn.disabled = true;
        setTimeout(randomTarget, 1200);
    } else {
        feedback.textContent = `Try again! You placed it at (${dotCoord.x}, ${dotCoord.y})`;
        feedback.style.color = '#bb0000';
    }
});

// Initialize first target
randomTarget();
