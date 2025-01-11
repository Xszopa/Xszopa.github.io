const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("backToMenuBtn");

let currentGame = null; // Zmienna do wyboru gry
let snakeGame; // Deklaracja zmiennej dla gry Snake
let breakoutGame; // Deklaracja zmiennej dla gry Breakout
let bird, pipes, score, gameSpeed, gameOver;

    canvas.width = window.innerWidth*0.8;
    canvas.height = window.innerHeight*0.7;

// Wyświetlanie modal na początku
const menuModal = document.getElementById("menuModal");
menuModal.style.display = "flex";

// Menu wyboru gry
document.getElementById("flappyBirdBtn").addEventListener("click", () => {
    startGame("flappyBird");
});

document.getElementById("breakoutBtn").addEventListener("click", () => {
    startGame("breakout");
});

document.getElementById("carBtn").addEventListener("click", () => {
    startGame("car");
});

document.getElementById("snakeBtn").addEventListener("click", () => {
    startGame("snake");
});


document.getElementById("backToMenuBtn").addEventListener("click", () => {
    stopGame();
    menuModal.style.display = "flex";
    canvas.style.display = "none";
});

// Funkcja do uruchamiania gry
function startGame(game) {
    menuModal.style.display = "none";
    canvas.style.display = "block";
    currentGame = game;
    if (game === "flappyBird") {
        initFlappyBird();
    } else if (game === "breakout") {
        initBreakout();
    } else if (game === "snake") {
        initSnake();
    }else if (game === "car") {
        initCarGame();
    }
}

function stopGame() {
    if (currentGame === "flappyBird") {
        gameOver = true;
    } else if (currentGame === "breakout") {
        breakoutGame.running = false;
    } else if (currentGame === "snake") {
        snakeGame.running = false;
    }
    currentGame = null;
}




function initCarGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Setup canvas size
    canvas.width = window.innerWidth*0.8;
    canvas.height = window.innerHeight*0.7;

    // Car object (now a square instead of a rectangle)
    const car = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        size: 50, // Changed to square
        color: 'red',
        speed: 5,
    };

    // Shuriken object array
    const shurikens = [];
    let difficulty = 1; // Difficulty level starts at 1
    let gameOver = false;
    let spawnRate = 0.005; // Very low spawn rate initially
    let spawnInterval = 2000; // Longer interval for spawning shurikens
    let maxShurikens = 5; // Initially only a few shurikens on the screen
    let score = 0; // Player's score
    let startTime = Date.now(); // Start time for the game

    // Handle keyboard inputs
    const keys = {};
    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    // Create a new shuriken with more randomization
    function createShuriken() {
        const side = Math.random() * (50 - 20) + 20; // Random size between 20 and 50
        let spawnEdge = Math.floor(Math.random() * 4); // Randomly choose an edge (0-3)
        let x, y, angle = Math.random() * Math.PI * 2; // Random starting angle
        let speed = Math.random() * 1 + 1; // Slow speed initially

        // Calculate spawn position based on the edge
        if (spawnEdge === 0) { // Top
            x = Math.random() * canvas.width;
            y = 0;
        } else if (spawnEdge === 1) { // Right
            x = canvas.width;
            y = Math.random() * canvas.height;
        } else if (spawnEdge === 2) { // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height;
        } else { // Left
            x = 0;
            y = Math.random() * canvas.height;
        }

        // Check if shuriken collides with others
        for (let shuriken of shurikens) {
            const dx = shuriken.x - x;
            const dy = shuriken.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < side * 2) {
                return; // Avoid spawning too close to another shuriken
            }
        }

        const shuriken = {
            x: x,
            y: y,
            side: side,
            angle: angle,
            speed: speed,
            lifetime: Math.random() * 5000 + 2000, // Random lifetime between 2000 and 7000 ms
            spawnTime: Date.now(),
        };

        shurikens.push(shuriken);
    }

    // Check if a point is inside a square
    function isPointInSquare(px, py, square) {
        return px > square.x - square.size / 2 && px < square.x + square.size / 2 &&
               py > square.y - square.size / 2 && py < square.y + square.size / 2;
    }

    // Check collision between shuriken and car (square)
    function checkCollision(shuriken, car) {
        // Calculate the 3 vertices of the shuriken (triangle)
        const points = [
            { x: shuriken.x + Math.cos(shuriken.angle) * shuriken.side / 2, y: shuriken.y + Math.sin(shuriken.angle) * shuriken.side / 2 },
            { x: shuriken.x + Math.cos(shuriken.angle + 2 * Math.PI / 3) * shuriken.side / 2, y: shuriken.y + Math.sin(shuriken.angle + 2 * Math.PI / 3) * shuriken.side / 2 },
            { x: shuriken.x + Math.cos(shuriken.angle - 2 * Math.PI / 3) * shuriken.side / 2, y: shuriken.y + Math.sin(shuriken.angle - 2 * Math.PI / 3) * shuriken.side / 2 },
        ];

        // Check if any point of the shuriken is inside the car's square
        for (let point of points) {
            if (isPointInSquare(point.x, point.y, car)) {
                return true;
            }
        }

        return false;
    }

    // Update and draw shurikens
    function updateShurikens() {
        const currentTime = Date.now();
        for (let i = 0; i < shurikens.length; i++) {
            const shuriken = shurikens[i];

            // Check if shuriken's lifetime has ended
            if (currentTime - shuriken.spawnTime > shuriken.lifetime) {
                shurikens.splice(i, 1);
                i--; // Adjust index after removal
                continue;
            }

            // Rotate shuriken
            shuriken.angle += 0.1 * Math.random(); // Random rotation speed

            // Move shuriken towards the car
            const angleToCar = Math.atan2(car.y - shuriken.y, car.x - shuriken.x);
            shuriken.x += Math.cos(angleToCar) * shuriken.speed;
            shuriken.y += Math.sin(angleToCar) * shuriken.speed;

            // Check for collision with the car
            if (checkCollision(shuriken, car)) {
                gameOver = true;
                return;
            }
        }
    }

    // Draw a shuriken
    function drawShuriken(shuriken) {
        ctx.save();
        ctx.translate(shuriken.x, shuriken.y);
        ctx.rotate(shuriken.angle);
        ctx.beginPath();
        ctx.moveTo(0, -shuriken.side / 2);
        ctx.lineTo(shuriken.side / 2, 0);
        ctx.lineTo(0, shuriken.side / 2);
        ctx.lineTo(-shuriken.side / 2, 0);
        ctx.closePath();
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.restore();
    }

    // Draw the scoreboard (score and time)
    function drawScoreboard() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 100);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('Score: ' + elapsedTime * 5, 20, 40);
        ctx.fillText('Time: ' + elapsedTime/10 + 's', 20, 80);
    }

    // Draw the Game Over screen
    function drawGameOver() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        ctx.font = '50px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('Score: ' + score, canvas.width / 2 - 50, canvas.height / 2 + 50);
        ctx.fillText('Time: ' + elapsedTime + 's', canvas.width / 2 - 50, canvas.height / 2 + 100);
    }

    // Game loop
    function gameLoop() {
        if (gameOver) {
            drawGameOver();
            return;
        }

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Move car based on input
        if (keys['a'] && car.x > 0) car.x -= car.speed;
        if (keys['d'] && car.x < canvas.width - car.size) car.x += car.speed;
        if (keys['w'] && car.y > 0) car.y -= car.speed;
        if (keys['s'] && car.y < canvas.height - car.size) car.y += car.speed;

        // Create new shurikens periodically
        if (Math.random() < spawnRate && shurikens.length < maxShurikens) {
            createShuriken();
        }

        // Increase spawn rate and max shurikens over time
        if (difficulty < 5) {
            difficulty += 0.0002; // Slow increase in difficulty
            spawnRate += 0.00001; // Gradually increase spawn rate
            maxShurikens = Math.min(10, maxShurikens + 0.02); // Gradually increase max number of shurikens
        }

        // Update and draw shurikens
        updateShurikens();
        for (let shuriken of shurikens) {
            drawShuriken(shuriken);
        }

        // Update score based on time alive (or number of shurikens destroyed)
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        score = elapsedTime; // Set score based on time

        // Draw the car (square)
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x - car.size / 2, car.y - car.size / 2, car.size, car.size);

        // Draw the scoreboard
        drawScoreboard();

        // Loop the game
        requestAnimationFrame(gameLoop);
    }

    // Start the game loop
    gameLoop();
}
class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Dostosowanie rozdzielczości
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.7;

        this.gridSize = 30; // Zwiększony rozmiar "kratki"
        this.snake = [{ x: 5, y: 5 }]; // Początkowa długość węża
        this.apple = { x: 10, y: 10 }; // Początkowa pozycja jabłka
        this.direction = { x: 1, y: 0 }; // Początkowy kierunek (w prawo)
        this.newDirection = { x: 1, y: 0 };
        this.running = false;

        this.score = 0;

        this.lastFrameTime = 0;
        this.gameSpeed = 100; // Szybkość gry

        document.addEventListener("keydown", this.changeDirection.bind(this));
    }

    changeDirection(event) {
        const key = event.key;
        if ((key === "ArrowUp" || key === "w") && this.direction.y === 0) {
            this.newDirection = { x: 0, y: -1 };
        } else if ((key === "ArrowDown" || key === "s") && this.direction.y === 0) {
            this.newDirection = { x: 0, y: 1 };
        } else if ((key === "ArrowLeft" || key === "a") && this.direction.x === 0) {
            this.newDirection = { x: -1, y: 0 };
        } else if ((key === "ArrowRight" || key === "d") && this.direction.x === 0) {
            this.newDirection = { x: 1, y: 0 };
        }
    }

    update() {
        // Zmiana kierunku
        this.direction = this.newDirection;

        // Przesuwanie węża
        const head = { ...this.snake[0] }; // Kopiowanie głowy
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Sprawdzenie kolizji ze ścianami
        if (
            head.x < 0 ||
            head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 ||
            head.y >= this.canvas.height / this.gridSize
        ) {
            this.running = false;
            alert("Koniec gry! Twój wynik: " + this.score);
            return;
        }

        // Sprawdzenie kolizji z własnym ciałem
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.running = false;
                alert("Koniec gry! Twój wynik: " + this.score);
                return;
            }
        }

        // Dodanie nowej głowy
        this.snake.unshift(head);

        // Sprawdzenie, czy wąż zjadł jabłko
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score++;
            this.placeApple();
        } else {
            this.snake.pop(); // Usunięcie ostatniego segmentu, jeśli nie zjadł jabłka
        }
    }

placeApple() {
    // Oblicz liczbę dostępnych komórek w poziomie i pionie
    const maxX = Math.floor(this.canvas.width / this.gridSize) - 1;
    const maxY = Math.floor(this.canvas.height / this.gridSize) - 1;

    // Generuj losowe pozycje jabłka w granicach planszy
    this.apple.x = Math.floor(Math.random() * (maxX + 1));
    this.apple.y = Math.floor(Math.random() * (maxY + 1));
}


    draw() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Rysowanie węża
        this.ctx.fillStyle = "#32CD32";

        // Rysowanie pierwszych segmentów jako płynne okręgi (poświata)
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];

            const radius = this.gridSize / 2; // Okrągły segment węża
            const x = segment.x * this.gridSize + radius;
            const y = segment.y * this.gridSize + radius;

            // Rysowanie okręgów na pozycji segmentu
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Rysowanie jabłka
        this.ctx.fillStyle = "#FF0000";
        const appleRadius = this.gridSize / 2;
        this.ctx.beginPath();
        this.ctx.arc(
            this.apple.x * this.gridSize + appleRadius,
            this.apple.y * this.gridSize + appleRadius,
            appleRadius,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Rysowanie wyniku
        this.ctx.font = "18px Arial";
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillText("Wynik: " + this.score, 10, 30);
    }

    start() {
        this.running = true;
        this.placeApple();
        this.gameLoop(0);
    }

    gameLoop(timestamp) {
        if (this.running) {
            const deltaTime = timestamp - this.lastFrameTime;
            if (deltaTime >= this.gameSpeed) {
                this.update();
                this.draw();
                this.lastFrameTime = timestamp; // Zaktualizowanie ostatniego czasu klatki
            }
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp)); // Płynniejsza animacja
        }
    }
}

function initSnake() {
    const canvas = document.getElementById("gameCanvas");
    const snakeGame = new SnakeGame(canvas);
    snakeGame.start();
}

// Dodanie przycisku uruchamiającego grę
document.getElementById("startGameButton").addEventListener("click", initSnake);



// --- Flappy Bird ---
class Bird {
    constructor() {
        this.x = 50;
        this.y = canvas.height / 2;
        this.width = 20;
        this.height = 20;
        this.gravity = 0.3;
        this.lift = -6; // Mniejszy zakres skoku
        this.velocity = 0;
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Zapewnienie, że ptak nie wyleci poza ekran
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }

    jump() {
        this.velocity = this.lift;
    }

    draw() {
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Pipe {
    constructor() {
        this.width = 40;
        this.spacing = 200;
        this.gap = Math.floor(Math.random() * (canvas.height - this.spacing));
        this.x = canvas.width;
        this.y = this.gap;
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x, 0, this.width, this.y);
        ctx.fillRect(this.x, this.y + this.spacing, this.width, canvas.height - (this.y + this.spacing));
    }
}

function initFlappyBird() {
    bird = new Bird();
    pipes = [];
    score = 0;
    gameSpeed = 2; // Początkowa prędkość przesuwania rur
    gameOver = false;
    document.addEventListener("keydown", (e) => {
        if (e.key === " ") {
            bird.jump();
        }
    });
    drawFlappyBird();
}

function drawFlappyBird() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.update();
    bird.draw();

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].update();
        pipes[i].draw();

        if (
            pipes[i].x < bird.x + bird.width &&
            pipes[i].x + pipes[i].width > bird.x &&
            (bird.y < pipes[i].y || bird.y + bird.height > pipes[i].y + pipes[i].spacing)
        ) {
            gameOver = true;
        }
    }

    pipes = pipes.filter((pipe) => pipe.x + pipe.width > 0);

    if (gameOver) {
        ctx.fillStyle = "#000";
        ctx.font = "30px Arial";
        ctx.fillText("Koniec gry!", 100, canvas.height / 2);
        ctx.fillText("Wynik: " + score, 120, canvas.height / 2 + 40);
        return;
    }

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        pipes.push(new Pipe());
    }

    score++;

    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Wynik: " + score, 10, 30);

    // Zwiększanie prędkości gry w miarę upływu czasu
    if (score % 100 === 0) {
        gameSpeed += 0.2;
    }

    requestAnimationFrame(drawFlappyBird);
}



class Breakout {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Stałe wymiary canvas
        this.canvas.width = 900;
        this.canvas.height = 480;

        // Paletka
        this.paddle = {
            x: this.canvas.width / 2 - 75,
            y: this.canvas.height - 40,
            width: 150,
            height: 15,
            speed: 8,
            dx: 0
        };

        // Piłka
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 60,
            radius: 10,
            speed: 5,
            dx: 5,
            dy: -5
        };

        // Klocki
        this.bricks = [];
        this.rows = 6;
        this.columns = 15;
        this.brickWidth = (this.canvas.width - 50) / this.columns;
        this.brickHeight = 20;
        this.brickPadding = 1;
        this.brickOffsetTop = 50;
        this.brickOffsetLeft = 15;

        this.score = 0;
        this.lives = 3;
        this.running = false;

        this.initBricks();
        document.addEventListener("keydown", this.keyDownHandler.bind(this));
        document.addEventListener("keyup", this.keyUpHandler.bind(this));
        document.addEventListener("mousemove", this.mouseMoveHandler.bind(this)); // Obsługuje myszkę
        document.addEventListener("click", this.mouseClickHandler.bind(this));  // Obsługuje kliknięcia
    }

    initBricks() {
        for (let c = 0; c < this.columns; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.rows; r++) {
                this.bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
    }

    drawBricks() {
        for (let c = 0; c < this.columns; c++) {
            for (let r = 0; r < this.rows; r++) {
                const brick = this.bricks[c][r];
                if (brick.status === 1) {
                    const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    brick.x = brickX;
                    brick.y = brickY;

                    this.ctx.beginPath();
                    this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = "#0095DD";
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }
        }
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = "#FF4500";
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawScore() {
        this.ctx.font = "18px Arial";
        this.ctx.fillStyle = "#000";
        this.ctx.fillText("Wynik: " + this.score, 10, 30);
    }

    drawLives() {
        this.ctx.font = "18px Arial";
        this.ctx.fillStyle = "#000";
        this.ctx.fillText("Życia: " + this.lives, this.canvas.width - 80, 30);
    }

    collisionDetection() {
        for (let c = 0; c < this.columns; c++) {
            for (let r = 0; r < this.rows; r++) {
                const brick = this.bricks[c][r];
                if (brick.status === 1) {
                    if (
                        this.ball.x > brick.x &&
                        this.ball.x < brick.x + this.brickWidth &&
                        this.ball.y > brick.y &&
                        this.ball.y < brick.y + this.brickHeight
                    ) {
                        this.ball.dy = -this.ball.dy;
                        brick.status = 0;
                        this.score++;
                        if (this.score === this.rows * this.columns) {
                            alert("Wygrałeś!");
                            this.running = false;
                            this.reset();
                        }
                    }
                }
            }
        }
    }

    keyDownHandler(e) {
        if (e.key === "ArrowRight") {
            this.paddle.dx = this.paddle.speed;
        } else if (e.key === "ArrowLeft") {
            this.paddle.dx = -this.paddle.speed;
        }
    }

    keyUpHandler(e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            this.paddle.dx = 0;
        }
    }

    mouseMoveHandler(e) {
        const relativeX = e.clientX - this.canvas.offsetLeft;
        if (relativeX > 0 && relativeX < this.canvas.width) {
            this.paddle.x = relativeX - this.paddle.width / 2;
        }
    }

    mouseClickHandler(event) {
        console.log("Kliknięto w pozycję:", event.clientX, event.clientY);
    }

    update() {
        // Aktualizacja paletki
        this.paddle.x += this.paddle.dx;
        if (this.paddle.x < 0) this.paddle.x = 0;
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }

        // Aktualizacja piłki
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Odbicia od ścian
        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        } else if (this.ball.y + this.ball.radius > this.paddle.y &&
                   this.ball.x > this.paddle.x &&
                   this.ball.x < this.paddle.x + this.paddle.width) {
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width - 0.5; // -0.5 do 0.5
            this.ball.dx = hitPos * 10; // Zmiana kąta odbicia
            this.ball.dy = -Math.abs(this.ball.dy); // Odbicie do góry
        } else if (this.ball.y + this.ball.radius > this.canvas.height) {
            this.lives--;
            if (!this.lives) {
                alert("Koniec gry!");
                this.running = false;
                this.reset();
            } else {
                this.resetBall();
            }
        }

        this.collisionDetection();
    }


    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 60;
        this.ball.dx = 5;
        this.ball.dy = -5;
    }

    reset() {
        this.initBricks();
        this.resetBall();
        this.score = 0;
        this.lives = 3;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBricks();
        this.drawPaddle();
        this.drawBall();
        this.drawScore();
        this.drawLives();
        this.update();
        if (this.running) {
            requestAnimationFrame(this.draw.bind(this));
        }
    }

    start() {
        this.running = true;
        this.draw();
    }
}
function initBreakout() {
    breakoutGame = new Breakout(canvas);
    breakoutGame.start();
}