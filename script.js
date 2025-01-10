const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 480;

const menuModal = document.getElementById("menuModal");
menuModal.style.display = "flex";

let currentGame = null;
let animationFrameId;

// Przycisk powrotu do menu
document.getElementById("backToMenuBtn").addEventListener("click", () => {
    cancelAnimationFrame(animationFrameId);
    currentGame = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    menuModal.style.display = "flex";
    canvas.style.display = "none";
});

document.getElementById("flappyBirdBtn").addEventListener("click", () => startGame("flappyBird"));
document.getElementById("breakoutBtn").addEventListener("click", () => startGame("breakout"));

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

// Breakout
class Breakout {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.paddle = { x: canvas.width / 2 - 75, y: canvas.height - 40, width: 150, height: 15, dx: 0, speed: 8 };
        this.ball = { x: canvas.width / 2, y: canvas.height - 60, radius: 10, dx: 4, dy: -4 };
        this.bricks = [];
        this.rows = 6;
        this.columns = 10;
        this.brickWidth = (canvas.width - 60) / this.columns;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.score = 0;
        this.lives = 3;
        this.initBricks();

        document.addEventListener("keydown", this.keyDownHandler.bind(this));
        document.addEventListener("keyup", this.keyUpHandler.bind(this));
    }

    initBricks() {
        this.bricks = Array.from({ length: this.rows }, (_, row) =>
            Array.from({ length: this.columns }, (_, col) => ({
                x: col * (this.brickWidth + this.brickPadding) + 30,
                y: row * (this.brickHeight + this.brickPadding) + 40,
                status: 1,
            }))
        );
    }

    drawBricks() {
        this.bricks.forEach((row) =>
            row.forEach((brick) => {
                if (brick.status === 1) {
                    this.ctx.beginPath();
                    this.ctx.rect(brick.x, brick.y, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = "#0095DD";
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            })
        );
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
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#000";
        this.ctx.fillText(`Score: ${this.score}`, 8, 20);
    }

    drawLives() {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#000";
        this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 65, 20);
    }

    collisionDetection() {
        this.bricks.forEach((row) => {
            row.forEach((brick) => {
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
                            alert("You win!");
                            document.getElementById("backToMenuBtn").click();
                        }
                    }
                }
            });
        });
    }

    update() {
        this.paddle.x += this.paddle.dx;
        if (this.paddle.x < 0) this.paddle.x = 0;
        if (this.paddle.x + this.paddle.width > this.canvas.width) this.paddle.x = this.canvas.width - this.paddle.width;

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }

        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        } else if (this.ball.y + this.ball.radius > this.paddle.y &&
                   this.ball.x > this.paddle.x &&
                   this.ball.x < this.paddle.x + this.paddle.width) {
            this.ball.dy = -this.ball.dy;
        } else if (this.ball.y + this.ball.radius > this.canvas.height) {
            this.lives--;
            if (this.lives === 0) {
                alert("Game Over");
                document.getElementById("backToMenuBtn").click();
            } else {
                this.resetBall();
            }
        }

        this.collisionDetection();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 60;
        this.ball.dx = 4;
        this.ball.dy = -4;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBricks();
        this.drawPaddle();
        this.drawBall();
        this.drawScore();
        this.drawLives();
        this.update();

        if (currentGame === "breakout") {
            animationFrameId = requestAnimationFrame(this.draw.bind(this));
        }
    }

    start() {
        this.draw();
    }
}

function initBreakout() {
    const breakout = new Breakout(canvas);
    breakout.start();
}

// Flappy Bird placeholder
function initFlappyBird() {
    alert("Flappy Bird is not implemented yet!");
    document.getElementById("backToMenuBtn").click();
}
