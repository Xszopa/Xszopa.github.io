const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let currentGame = null;

canvas.width = 900;
canvas.height = 480;

const menuModal = document.getElementById("menuModal");
menuModal.style.display = "flex";

document.getElementById("flappyBirdBtn").addEventListener("click", () => startGame("flappyBird"));
document.getElementById("breakoutBtn").addEventListener("click", () => startGame("breakout"));
document.getElementById("backToMenuBtn").addEventListener("click", returnToMenu);

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

function returnToMenu() {
    cancelAnimationFrame(animationFrameId); // Zatrzymanie animacji
    currentGame = null;
    menuModal.style.display = "flex";
    canvas.style.display = "none";
    location.reload();
}

let animationFrameId = null;

class Breakout {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.paddle = { x: canvas.width / 2 - 75, y: canvas.height - 40, width: 150, height: 15, speed: 8, dx: 0 };
        this.ball = { x: canvas.width / 2, y: canvas.height - 60, radius: 10, speed: 5, dx: 5, dy: -5 };
        this.bricks = [];
        this.rows = 6;
        this.columns = 15;
        this.brickWidth = (canvas.width - 50) / this.columns;
        this.brickHeight = 20;
        this.brickPadding = 2;
        this.brickOffsetTop = 50;
        this.brickOffsetLeft = 25;
        this.score = 0;
        this.lives = 3;
        this.running = false;
        this.initBricks();
        document.addEventListener("keydown", this.keyDownHandler.bind(this));
        document.addEventListener("keyup", this.keyUpHandler.bind(this));
    }

    initBricks() {
        this.bricks = Array.from({ length: this.columns }, (_, c) =>
            Array.from({ length: this.rows }, (_, r) => ({
                x: 0,
                y: 0,
                status: 1
            }))
        );
    }

    drawBricks() {
        this.bricks.forEach((column, c) =>
            column.forEach((brick, r) => {
                if (brick.status === 1) {
                    const x = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    const y = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    brick.x = x;
                    brick.y = y;
                    this.ctx.beginPath();
                    this.ctx.rect(x, y, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = "#0095DD";
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            })
        );
    }

    collisionDetection() {
        this.bricks.forEach((column) =>
            column.forEach((brick) => {
                if (brick.status === 1) {
                    if (
                        this.ball.x + this.ball.radius > brick.x &&
                        this.ball.x - this.ball.radius < brick.x + this.brickWidth &&
                        this.ball.y + this.ball.radius > brick.y &&
                        this.ball.y - this.ball.radius < brick.y + this.brickHeight
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
            })
        );
    }

    keyDownHandler(e) {
        if (e.key === "ArrowRight") this.paddle.dx = this.paddle.speed;
        else if (e.key === "ArrowLeft") this.paddle.dx = -this.paddle.speed;
    }

    keyUpHandler(e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") this.paddle.dx = 0;
    }

    update() {
        this.paddle.x += this.paddle.dx;
        if (this.paddle.x < 0) this.paddle.x = 0;
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }

        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        } else if (
            this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width
        ) {
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width - 0.5;
            this.ball.dx = hitPos * 10;
            this.ball.dy = -Math.abs(this.ball.dy);
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
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = "#FF4500";
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.font = "18px Arial";
        this.ctx.fillStyle = "#000";
        this.ctx.fillText(`Wynik: ${this.score}`, 10, 30);
        this.ctx.fillText(`Życia: ${this.lives}`, this.canvas.width - 80, 30);
        this.update();
        if (this.running) {
            animationFrameId = requestAnimationFrame(this.draw.bind(this));
        }
    }

    start() {
        this.running = true;
        this.draw();
    }
}

function initBreakout() {
    const breakoutGame = new Breakout(canvas);
    breakoutGame.start();
}
