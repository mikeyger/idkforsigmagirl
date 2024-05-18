const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerImg = new Image();
playerImg.src = 'user.jpg';
const bossImg = new Image();
bossImg.src = 'boss.png';

const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 35,
    height: 35,
    speed: 7,
    bullets: []
};

const boss = {
    x: canvas.width / 2 - 50,
    y: 0,
    width: 100,
    height: 100,
    speedX: 5,
    speedY: 5,
    bullets: []
};

const keys = {};
let gameOver = false;
let score = 0;
let highestScore = localStorage.getItem('highestScore') || 0;

function drawImage(obj, img) {
    ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
}

function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
}

function shootBullet() {
    const bullet = {
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        color: 'yellow',
        speed: 7
    };
    player.bullets.push(bullet);
}

function moveBullets() {
    player.bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) player.bullets.splice(index, 1);
    });
}

function moveBoss() {
    boss.x += boss.speedX;
    boss.y += boss.speedY;

    if (boss.x <= 0 || boss.x >= canvas.width - boss.width) boss.speedX *= -1;
    if (boss.y <= 0 || boss.y >= canvas.height / 2) boss.speedY *= -1;

    if (Math.random() < 0.1) shootBossBullet();
}

function shootBossBullet() {
    const directions = [
        { x: 0, y: 4 },
        { x: 4, y: 0 },
        { x: 0, y: -4 },
        { x: -4, y: 0 },
        { x: 2.8, y: 2.8 },
        { x: -2.8, y: 2.8 },
        { x: 2.8, y: -2.8 },
        { x: -2.8, y: -2.8 }
    ];
    directions.forEach(dir => {
        const bullet = {
            x: boss.x + boss.width / 2 - 2.5,
            y: boss.y + boss.height / 2 - 2.5,
            width: 5,
            height: 5,
            color: 'white',
            speedX: dir.x,
            speedY: dir.y
        };
        boss.bullets.push(bullet);
    });
}

function moveBossBullets() {
    boss.bullets.forEach((bullet, index) => {
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            boss.bullets.splice(index, 1);
        }
    });
}

function detectCollisions() {
    player.bullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < boss.x + boss.width &&
            bullet.x + bullet.width > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bullet.height > boss.y) {
            player.bullets.splice(bulletIndex, 1);
            // Boss hit logic can go here
        }
    });

    boss.bullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            // Collision detected, game over logic
            gameOver = true;
            if (score > highestScore) {
                highestScore = score;
                localStorage.setItem('highestScore', highestScore);
            }
        }
    });
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText('Restart?', canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText(`Highest Score: ${highestScore}`, canvas.width / 2, canvas.height / 2 + 80);

    const buttonX = canvas.width / 2 - 50;
    const buttonY = canvas.height / 2 + 100;
    const buttonWidth = 100;
    const buttonHeight = 50;

    ctx.fillStyle = 'green';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Bet', canvas.width / 2, canvas.height / 2 + 137);

    canvas.addEventListener('click', function onClick(event) {
        const x = event.clientX - canvas.offsetLeft;
        const y = event.clientY - canvas.offsetTop;

        if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
            restartGame();
            canvas.removeEventListener('click', onClick);
        }
    });
}

function restartGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    player.bullets = [];
    boss.x = canvas.width / 2 - 50;
    boss.y = 0;
    boss.bullets = [];
    gameOver = false;
    score = 0;
    gameLoop();
}

function gameLoop() {
    if (gameOver) {
        drawGameOverScreen();
        return;
    }

    score++; // Increment score every frame

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    moveBullets();
    moveBoss();
    moveBossBullets();
    detectCollisions();

    drawImage(player, playerImg);
    player.bullets.forEach(bullet => drawRect(bullet));
    drawImage(boss, bossImg);
    boss.bullets.forEach(bullet => drawRect(bullet));

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30); // Display current score

    requestAnimationFrame(gameLoop);
}

function drawRect(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') shootBullet();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

gameLoop();


// Replace keyboard event listeners with touch event listeners
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

// Define touch event handlers
let touchX = null;
let touchY = null;

function handleTouchStart(event) {
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault();
    if (!touchX || !touchY) {
        return;
    }

    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;

    const deltaX = x - touchX;
    const deltaY = y - touchY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            keys['ArrowRight'] = true;
            keys['ArrowLeft'] = false;
        } else {
            keys['ArrowLeft'] = true;
            keys['ArrowRight'] = false;
        }
    } else {
        if (deltaY > 0) {
            keys['ArrowDown'] = true;
            keys['ArrowUp'] = false;
        } else {
            keys['ArrowUp'] = true;
            keys['ArrowDown'] = false;
        }
    }
}

// Adjust canvas size based on device pixel ratio
const scaleFactor = window.devicePixelRatio;
canvas.width = window.innerWidth * scaleFactor;
canvas.height = window.innerHeight * scaleFactor;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

// Scale context to account for device pixel ratio
ctx.scale(scaleFactor, scaleFactor);

// Adjust player speed and bullet speed for mobile
player.speed = 3;
player.bullets.forEach(bullet => bullet.speed = 5);

// Update movePlayer() function to handle touch controls

function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
}

