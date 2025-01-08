const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let currentGame = null; // Zmienna do wyboru gry
let bird, pipes, score, gameSpeed, gameOver;

canvas.width = 900;
canvas.height = 480;

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

// Funkcja do uruchamiania gry
function startGame(game) {
    menuModal.style.display = "none";
    canvas.style.display = "block";
    currentGame = game;
    if (game === "flappyBird") {
        initFlappyBird();
    } else if (game === "breakout") {
        initBreakout();
    }
}

// --- Flappy Bird ---
class Bird {
    constructor() {
        this.x = 50;
        this.y = canvas.height / 2;
        this.width = 20;
        this.height = 20;
        this.gravity = 0.5;
        this.lift = -7; // Mniejszy zakres skoku
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

function initBreakout() {
    const breakoutGame = new Breakout(canvas);
    breakoutGame.start();
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
            y: this.canvas.height - 40, // Podniesiona wyżej, by wyglądała poprawnie
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
        this.columns = 15; // Więcej kolumn, by rozciągnąć klocki
        this.brickWidth = (this.canvas.width - 50) / this.columns; // Automatyczne dopasowanie szerokości
        this.brickHeight = 20;
        this.brickPadding = 2; // Mniejsze odstępy
        this.brickOffsetTop = 50;
        this.brickOffsetLeft = 25;

        this.score = 0;
        this.lives = 3;
        this.running = false;

        this.initBricks();
        document.addEventListener("keydown", this.keyDownHandler.bind(this));
        document.addEventListener("keyup", this.keyUpHandler.bind(this));
        document.addEventListener("mousemove", this.mouseMoveHandler.bind(this)); // Obsługa myszki
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

