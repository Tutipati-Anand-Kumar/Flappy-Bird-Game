 const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bgMusic = document.getElementById("startMusic");      // Background/start music
const gameOverSound = document.getElementById("gameOverMusic"); // Game over sound
const flapSound = new Audio("audio/flap.wav");              // Only this needs new Audio
bgMusic.loop = true;
bgMusic.volume = 0.6;
const messageOverlay = document.getElementById("messageOverlay");
messageOverlay.style.display = "block";
messageOverlay.textContent = "Press ▶️ to Start";

let soundOn = true;
let gravity = 0.2; // your original constant gravity
let pipeSpeed = 2; // fixed pipe speed
const soundToggleBtn = document.getElementById("soundToggle");
soundToggleBtn.textContent = soundOn ? "🔊" : "🔇";
soundToggleBtn.addEventListener("click", () => {
soundOn = !soundOn;
soundToggleBtn.textContent = soundOn ? "🔊" : "🔇";
if (soundOn) {
    bgMusic.play();
} else {
    bgMusic.pause();
    gameOverSound.pause(); // Optional
}
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function createStars(count = 150) {
return Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1
}));
}

function createClouds(count = 20) {
return Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 1.5,
    speed: 0.2 + Math.random() * 0.8
}));
}
function togglePause() {
const pauseBtn = document.getElementById("pauseBtn");

if (!gameStarted) return; // Game hasn't started yet

if (isPaused) {
    // Resume the game
    isPaused = false;
    gameRunning = true;
    pauseBtn.textContent = "⏸️"; // Show pause icon
    update();
    pipeInterval = setInterval(addPipe, 2000);
    if (soundOn) bgMusic.play();
} else {
    // Pause the game
    isPaused = true;
    gameRunning = false;
    pauseBtn.textContent = "▶️"; // Show play icon
    clearInterval(pipeInterval);
    bgMusic.pause();
}
}
let stars = createStars(window.innerWidth < 500 ? 100 : 150);   // Default 100 stars
let clouds = createClouds(window.innerWidth < 500 ? 15 : 20); // Default 15 clouds

function drawStars() {
ctx.fillStyle = '#fff';
stars.forEach(star => {
    drawStar(ctx, star.x, star.y, 5, star.size, star.size / 2);
});
}

// Helper function to draw a 5-point star shape
function drawStar(ctx, x, y, points, outerRadius, innerRadius) {
const step = Math.PI / points;
ctx.beginPath();
for (let i = 0; i < 2 * points; i++) {
    const angle = i * step - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const sx = x + radius * Math.cos(angle);
    const sy = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
}
ctx.closePath();
ctx.fill();
}

function drawClouds() {
ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
clouds.forEach(cloud => {
    drawPuffyCloud(ctx, cloud.x, cloud.y);
});
}

// Helper function to draw a puffy cloud
function drawPuffyCloud(ctx, x, y) {
ctx.beginPath();
ctx.arc(x, y, 20, Math.PI * 0.5, Math.PI * 1.5);
ctx.arc(x + 25, y - 20, 25, Math.PI * 1.0, Math.PI * 1.85);
ctx.arc(x + 60, y - 15, 20, Math.PI * 1.37, Math.PI * 1.91);
ctx.arc(x + 80, y, 25, Math.PI * 1.5, Math.PI * 0.5);
ctx.closePath();
ctx.fill();
}

const birdImg = new Image();
birdImg.src = './photos/image_1.png'; // adjust path if needed

birdImg.onload = () => {
console.log("Bird image loaded ✅");
};
birdImg.onerror = () => {
console.error("❌ Bird image failed to load! Check file path.");
};

let distance =0;
let maxDistance = 0;
if (localStorage.getItem("maxDistance")) {
    maxDistance = parseInt(localStorage.getItem("maxDistance"));
    document.getElementById("maxDistance").textContent = maxDistance;
}

// Responsive canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let birdY = 200, birdVelocity = 0;
lift = -6;
let pipes = [], score = 0, highScore = 0, gameRunning = false;
for (let i = 0; i < 5; i++) {
pipes.push({
    x: 300 + i * 300, // increase spacing between pipes here
    height: Math.floor(Math.random() * 200) + 200
});
}
let bgHue = 200;
let bgScrollX = 0;
const scrollSpeed = 0.5;
let gameStarted = false;  // Track if the game ever started
let isPaused = false;     // Track pause state
let pipeInterval;
let gameStartTimeout;

if (localStorage.getItem("savedHighScore")) {
    document.getElementById("savedHighScore").textContent = localStorage.getItem("savedHighScore");
}

function drawBird() {
ctx.drawImage(birdImg, 80, birdY - 20, 40, 40); // draws bird at correct position
}

function drawPipe(pipe) {
let width = 50;

if (pipe.style === 'wood') {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);

    // Wood grain lines
    ctx.strokeStyle = '#5D3311';
    for (let i = 0; i < pipe.top; i += 10) {
    ctx.beginPath();
    ctx.moveTo(pipe.x, i);
    ctx.lineTo(pipe.x + width, i + 5);
    ctx.stroke();
    }

    for (let i = pipe.bottom; i < canvas.height; i += 10) {
    ctx.beginPath();
    ctx.moveTo(pipe.x, i);
    ctx.lineTo(pipe.x + width, i + 5);
    ctx.stroke();
    }

} else if (pipe.style === 'glass') {
    ctx.fillStyle = 'rgba(173,216,230, 0.3)';
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.strokeRect(pipe.x, 0, width, pipe.top);
    ctx.strokeRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);

} else if (pipe.style === 'steel') {
    let grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + width, 0);
    grad.addColorStop(0, '#aaa');
    grad.addColorStop(0.5, '#666');
    grad.addColorStop(1, '#aaa');
    ctx.fillStyle = grad;
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(pipe.x, 0, width, pipe.top);
    ctx.strokeRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);

} else if (pipe.style === 'crystal') {
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.moveTo(pipe.x, 0);
    ctx.lineTo(pipe.x + width, 0);
    ctx.lineTo(pipe.x + width - 10, pipe.top);
    ctx.lineTo(pipe.x + 10, pipe.top);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pipe.x, pipe.bottom);
    ctx.lineTo(pipe.x + width, pipe.bottom);
    ctx.lineTo(pipe.x + width - 10, canvas.height);
    ctx.lineTo(pipe.x + 10, canvas.height);
    ctx.closePath();
    ctx.fill();

} else if (pipe.style === 'lava') {
    let gradient = ctx.createLinearGradient(0, 0, 0, pipe.top);
    gradient.addColorStop(0, '#ff4500');
    gradient.addColorStop(1, '#8b0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);

    ctx.strokeStyle = '#330000';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(pipe.x, 0, width, pipe.top);
    ctx.strokeRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
    ctx.setLineDash([]);
}
    // Neon Style
else if (pipe.style === 'neon') {
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 20;
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
    ctx.shadowBlur = 0; // Reset glow
}

// Ice Style
else if (pipe.style === 'ice') {
    let iceGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + width, 0);
    iceGradient.addColorStop(0, '#a0e9ff');
    iceGradient.addColorStop(1, '#e0f7ff');
    ctx.fillStyle = iceGradient;
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);

    ctx.strokeStyle = '#b0e0e6';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(pipe.x, 0, width, pipe.top);
    ctx.strokeRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
    ctx.setLineDash([]);
}

// Cactus Style
else if (pipe.style === 'cactus') {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
    ctx.strokeStyle = '#006400';
    for (let i = 0; i < pipe.top; i += 15) {
    ctx.beginPath();
    ctx.moveTo(pipe.x + 5, i);
    ctx.lineTo(pipe.x + 10, i + 5);
    ctx.stroke();
    }
    for (let i = pipe.bottom; i < canvas.height; i += 15) {
    ctx.beginPath();
    ctx.moveTo(pipe.x + 5, i);
    ctx.lineTo(pipe.x + 10, i + 5);
    ctx.stroke();
    }
}
    else if (pipe.style === 'rainbow') {
    const colors = ['#ff0000', '#ff9900', '#ffff00', '#33cc33', '#3399ff', '#9900cc'];
    const bandHeight = 10;
    for (let y = 0; y < pipe.top; y += bandHeight) {
    ctx.fillStyle = colors[(y / bandHeight) % colors.length];
    ctx.fillRect(pipe.x, y, width, bandHeight);
    }
    for (let y = pipe.bottom; y < canvas.height; y += bandHeight) {
    ctx.fillStyle = colors[(y / bandHeight) % colors.length];
    ctx.fillRect(pipe.x, y, width, bandHeight);
    }
}
    else if (pipe.style === 'stone') {
    ctx.fillStyle = '#7d7d7d';
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);

    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 2;
    for (let i = 0; i < pipe.top; i += 15) {
    ctx.beginPath();
    ctx.moveTo(pipe.x, i);
    ctx.lineTo(pipe.x + width, i + 5);
    ctx.stroke();
    }
    for (let i = pipe.bottom; i < canvas.height; i += 15) {
    ctx.beginPath();
    ctx.moveTo(pipe.x, i);
    ctx.lineTo(pipe.x + width, i + 5);
    ctx.stroke();
    }
    ctx.lineWidth = 1;}
// Jungle Style
else if (pipe.style === 'jungle') {
    ctx.fillStyle = '#2e8b57';
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
    ctx.strokeStyle = '#006400';
    for (let i = 0; i < pipe.top; i += 20) {
    ctx.beginPath();
    ctx.arc(pipe.x + width / 2, i, 3, 0, 2 * Math.PI);
    ctx.stroke();
    }
    for (let i = pipe.bottom; i < canvas.height; i += 20) {
    ctx.beginPath();
    ctx.arc(pipe.x + width / 2, i, 3, 0, 2 * Math.PI);
    ctx.stroke();
    }
}

// Candy Style
else if (pipe.style === 'candy') {
    const stripes = ['#ff69b4', '#fff'];
    for (let y = 0; y < pipe.top; y += 10) {
    ctx.fillStyle = stripes[(y / 10) % 2];
    ctx.fillRect(pipe.x, y, width, 10);
    }
    for (let y = pipe.bottom; y < canvas.height; y += 10) {
    ctx.fillStyle = stripes[(y / 10) % 2];
    ctx.fillRect(pipe.x, y, width, 10);
    }
}

// Gold Style
else if (pipe.style === 'gold') {
    let grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + width, 0);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(0.5, '#FFA500');
    grad.addColorStop(1, '#FFD700');
    ctx.fillStyle = grad;
    ctx.fillRect(pipe.x, 0, width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
    ctx.strokeStyle = '#DAA520';
    ctx.strokeRect(pipe.x, 0, width, pipe.top);
    ctx.strokeRect(pipe.x, pipe.bottom, width, canvas.height - pipe.bottom);
}
}

function update() {
    if (!gameRunning || isPaused) return;

    // Background color animation
    bgHue += 0.1;
    if (bgHue > 360) bgHue = 0;
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, `hsl(${bgHue}, 100%, 75%)`);
    bgGradient.addColorStop(1, `hsl(${(bgHue + 60) % 360}, 100%, 90%)`);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scroll background
    bgScrollX -= scrollSpeed;
    if (bgScrollX <= -canvas.width) bgScrollX = 0;

    // Draw stars and clouds
    drawStars();

    clouds.forEach(c => {
    c.x -= c.speed;
    if (c.x < -100) c.x = canvas.width + Math.random() * 100;
    });
    drawClouds();

    // Ground
    ctx.fillStyle = "#228";
    ctx.fillRect(bgScrollX, canvas.height - 20, canvas.width * 2, 20);

    // ✨ Show "Get Ready" only before the game starts
    if (!gameStarted && !gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Get Ready!", canvas.width / 2, canvas.height / 2);
    requestAnimationFrame(update);
    return; // Stop further updates until game starts
    }

    // Gravity and bird motion
    // Increase gravity as distance increases (every 100 meters)
    birdVelocity += gravity;
    birdY += birdVelocity+0.3;

    // Check if bird goes out of bounds
    if (birdY > canvas.height || birdY < 0) {
    stopGame();
    return;
    }

    // Pipe logic
    pipes.forEach(pipe => {
    pipe.x -= 2;

    // Collision
    if (
        100 > pipe.x && 100 < pipe.x + 50 &&
        (birdY < pipe.top || birdY > pipe.bottom)
    ) {
        stopGame();
    }

    // Score update
    if (!pipe.passed && pipe.x + 50 < 100) {
        score++;
        document.getElementById('score').textContent = score;
        pipe.passed = true;
    }

    drawPipe(pipe);
    });

    pipes = pipes.filter(pipe => pipe.x > -50);

    // Update distance
    distance += 2;
    document.getElementById('distance').textContent = distance;

    // Draw bird
    drawBird();

    // Loop
    requestAnimationFrame(update);
}

function flap() {
    if (!gameRunning) return;
    birdVelocity = lift;
    if (soundOn) flapSound.play();
}

function addPipe() {
const gap = 150;
const pipeWidth = 50;
const topHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 50;

const styles = [
    'wood', 'glass', 'steel', 'crystal', 'lava',
    'neon', 'ice', 'cactus', 'rainbow', 'stone',
    'jungle', 'candy', 'gold' // 👈 your 3 new styles
];
const randomStyle = styles[Math.floor(Math.random() * styles.length)];

pipes.push({
    x: pipes.length > 0 ? pipes[pipes.length - 1].x + 280 : canvas.width,
    top: topHeight,
    bottom: topHeight + gap,
    style: randomStyle
});
}

function startGame() {
gameStarted = true;
gameOver = false;
gameRunning = true;

if (pipeInterval) clearInterval(pipeInterval);
if (gameStartTimeout) clearTimeout(gameStartTimeout);

// 🎵 Reset audio states
gameOverMusic.pause();
gameOverMusic.currentTime = 0;
bgMusic.currentTime = 0;
if (soundOn) bgMusic.play();
else bgMusic.pause();

birdY = canvas.height / 2;
birdVelocity = 0;
pipes = [];
score = 0;
distance = 0;
document.getElementById('distance').textContent = distance;
document.getElementById('score').textContent = score;

ctx.clearRect(0, 0, canvas.width, canvas.height);
drawBird();
drawScene();

messageOverlay.textContent = "Get Ready!";
messageOverlay.style.display = "block";

// 2-second delay before game starts
gameStartTimeout = setTimeout(() => {
    gameRunning = true;
    messageOverlay.style.display = "none"; // ✅ Hide the "Get Ready!" message here
    addPipe();
    update();
    pipeInterval = setInterval(() => addPipe(), 2000);
}, 2000);
}

function stopGame() {
gameRunning = false;
clearInterval(pipeInterval);

// 🎵 Play only if sound is on
if (soundOn) {
    bgMusic.pause();
    gameOverMusic.currentTime = 0;
    gameOverMusic.play();
} else {
    bgMusic.pause();
    gameOverMusic.pause();
}

if (score > highScore) {
    highScore = score;
    document.getElementById('highScore').textContent = highScore;
    localStorage.setItem("savedHighScore", highScore);
    document.getElementById("savedHighScore").textContent = highScore;
}
if (distance > maxDistance) {
    maxDistance = distance;
    localStorage.setItem("maxDistance", maxDistance);
    document.getElementById("maxDistance").textContent = maxDistance;
}
messageOverlay.textContent = "💀 Game Over\nPress 🔄 to Retry";
messageOverlay.style.display = "block";
}

function resetGame() {
    stopGame();
    messageOverlay.textContent = "Press ▶️ to Start";
    messageOverlay.style.display = "block";
    startGame();
}

function drawScene() {
// Background gradient
const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
bgGradient.addColorStop(0, `hsl(${bgHue}, 100%, 75%)`);
bgGradient.addColorStop(1, `hsl(${(bgHue + 60) % 360}, 100%, 90%)`);
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw stars, clouds, bird
drawStars();
drawClouds();
drawBird();

// Show "Press Start" message before game starts
if (!gameStarted && !gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🌟 Press ▶️ Start to Play 🌟", canvas.width / 2, canvas.height / 2 - 30);
}

// Show "Game Over" message when game ends
if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💀 Game Over 💀", canvas.width / 2, canvas.height / 2);
}
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
    flap();
    }
});

window.addEventListener("mousedown", flap);

window.addEventListener("touchstart", (e) => {
if (!isGamePaused && !isGameOver) {
    e.preventDefault();
    flap();
}
}, { passive: false });

window.addEventListener("resize", () => {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

stars = createStars(window.innerWidth < 500 ? 100 : 150);    // reuse the function
clouds = createClouds(window.innerWidth < 500 ? 15 : 20);  // reuse the function
});

// --- ✋ HAND GESTURE SETUP START ---
    const videoElement = document.querySelector('.input_video');
    let lastPinchTime = 0;

    // Gesture trigger gap (in ms)
    const PINCH_COOLDOWN = 600;

    // MediaPipe Hands setup
    const hands = new Hands({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8,
    });
    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
    });
    camera.start();

    // Handle hand landmarks
    function onResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

    const landmarks = results.multiHandLandmarks[0];
    const indexTip = landmarks[8];   // Index finger tip
    const thumbTip = landmarks[4];   // Thumb tip

    const dx = indexTip.x - thumbTip.x;
    const dy = indexTip.y - thumbTip.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const now = Date.now();
    if (distance < 0.05 && now - lastPinchTime > PINCH_COOLDOWN) {
        flap(); // your existing function
        lastPinchTime = now;
    }
    }

    // --- ✋ HAND GESTURE SETUP END ---
    const toggleBtn = document.getElementById("toggleVideoBtn");
    toggleBtn.addEventListener("click", () => {
    if (videoElement.style.display === "none") {
        videoElement.style.display = "block";
        videoElement.style.position = "fixed";
        videoElement.style.bottom = "50px";
        videoElement.style.right = "10px";
        videoElement.style.zIndex = "998";
        videoElement.style.width = "160px";
        videoElement.style.borderRadius = "12px";
        toggleBtn.textContent = "Hide Camera";
    } else {
        videoElement.style.display = "none";
        toggleBtn.textContent = "Show Camera";
    }
    });