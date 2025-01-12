// script.js

// Klasa Breakout
class Breakout {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.running = true;

        // Paddle properties
        this.paddle = {
            width: 100,
            height: 10,
            x: canvas.width / 2 - 50,
            y: canvas.height - 30
        };

        // Ball properties
        this.ball = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            radius: 8,
            speed: 4,
            dx: 4,
            dy: -4
        };

        // Bricks setup
        this.brickRowCount = 6;
        this.brickColumnCount = 10;
        this.brickWidth = (canvas.width - 20) / this.brickColumnCount;
        this.brickHeight = 30;
        this.brickPadding = 2;
        this.brickOffsetTop = 30;
        this.brickOffsetLeft = 10;
        this.bricks = this.createBricks();

        // Power-ups
        this.powerups = [];
        this.activePowerups = {
            biggerPaddle: false,
            fasterBall: false,
            multiball: false
        };

        this.score = 0;

        // Mouse tracking
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);

        // Start game loop
        this.gameLoop();
    }

    // ... (kontynuacja w następnej części)

// Metody klasy Breakout (kontynuacja)
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        this.paddle.x = mouseX - this.paddle.width;

        if (this.paddle.x < 0) {
            this.paddle.x = 0;
        }
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }
    }

    createBricks() {
        const bricks = [];
        for(let c = 0; c < this.brickColumnCount; c++) {
            bricks[c] = [];
            for(let r = 0; r < this.brickRowCount; r++) {
                bricks[c][r] = { 
                    x: 0, 
                    y: 0, 
                    status: 1,
                    color: `hsl(${(r * 360/this.brickRowCount)}, 70%, 50%)`
                };
            }
        }
        return bricks;
    }

    update() {
        if (!this.running) return;

        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with walls
        if(this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if(this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }

        // Ball collision with paddle
        if(this.ball.y + this.ball.radius > this.paddle.y &&
           this.ball.x > this.paddle.x && 
           this.ball.x < this.paddle.x + this.paddle.width) {
            this.ball.dy = -this.ball.speed;
            const hitPoint = (this.ball.x - (this.paddle.x + this.paddle.width/2)) / (this.paddle.width/2);
            this.ball.dx = hitPoint * this.ball.speed;
        }

        // Check game over
        if(this.ball.y + this.ball.radius > this.canvas.height) {
            this.gameOver();
            return;
        }

        // Check brick collision
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                const brick = this.bricks[c][r];
                if(brick.status === 1) {
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    
                    const ballLeft = this.ball.x - this.ball.radius;
                    const ballRight = this.ball.x + this.ball.radius;
                    const ballTop = this.ball.y - this.ball.radius;
                    const ballBottom = this.ball.y + this.ball.radius;
                    
                    if (ballRight > brickX && 
                        ballLeft < brickX + this.brickWidth && 
                        ballBottom > brickY && 
                        ballTop < brickY + this.brickHeight) {
                        
                        const fromLeft = Math.abs(ballRight - brickX);
                        const fromRight = Math.abs(brickX + this.brickWidth - ballLeft);
                        const fromTop = Math.abs(ballBottom - brickY);
                        const fromBottom = Math.abs(brickY + this.brickHeight - ballTop);
                        
                        const minDepth = Math.min(fromLeft, fromRight, fromTop, fromBottom);
                        
                        if (minDepth === fromLeft || minDepth === fromRight) {
                            this.ball.dx = -this.ball.dx;
                        } else {
                            this.ball.dy = -this.ball.dy;
                        }
                        
                        brick.status = 0;
                        this.score += 10;
                        
                        if(this.score === this.brickRowCount * this.brickColumnCount * 10) {
                            this.gameWin();
                            return;
                        }
                    }
                }
            }
        }
    }

    gameLoop() {
        if (!this.running) return;

        this.update();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw paddle
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();

        // Draw bricks
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                if(this.bricks[c][r].status === 1) {
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    
                    this.ctx.fillStyle = this.bricks[c][r].color;
                    this.ctx.fillRect(brickX, brickY, this.brickWidth, this.brickHeight);
                }
            }
        }

        // Draw score
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fillText(`Score: ${this.score}`, 8, 20);

        requestAnimationFrame(() => this.gameLoop());
    }

    gameOver() {
        this.running = false;
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = 'red';
        this.ctx.fillText('GAME OVER', this.canvas.width/2 - 125, this.canvas.height/2);
    }

    gameWin() {
        this.running = false;
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = 'green';
        this.ctx.fillText('YOU WIN!', this.canvas.width/2 - 100, this.canvas.height/2);
    }

    cleanup() {
        this.running = false;
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}

class FlappyBirdGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.running = false;
        
        // Bird properties
        this.bird = {
            x: 50,
            y: canvas.height / 2,
            velocity: 0,
            gravity: 0.5,
            jump: -10,
            size: 20
        };
        
        // Game properties
        this.pipes = [];
        this.score = 0;
        this.pipeSpawnTimer = 0;
        this.pipeWidth = 80;
        this.pipeGap = 250;
        this.pipeSpacing = 150;
        
        // Bind keyboard events
        this.handleKeyPress = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.handleKeyPress);
        
	

	this.displayStartMessage();
    }
    
handleKeyPress(event) {
    if (event.code === 'Space') {
        if (!this.running) {
            // Start the game
            this.running = true;
            this.gameLoop();
		this.bird.velocity = this.bird.jump;
        } else {
            // Make bird jump
            this.bird.velocity = this.bird.jump;
        }
    }
}
    
    displayStartMessage() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#87CEEB'; // Sky blue background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.strokeText('Press Space to Start', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText('Press Space to Start', this.canvas.width / 2, this.canvas.height / 2);
}
    
    update() {
        if (!this.running) return;

        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Keep bird in bounds
        if (this.bird.y > this.canvas.height - this.bird.size) {
            this.gameOver();
            return;
        }
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        
        // Spawn new pipes
        this.pipeSpawnTimer++;
        if (this.pipeSpawnTimer >= this.pipeSpacing) {
            this.pipeSpawnTimer = 0;
            const gapPosition = Math.random() * (this.canvas.height - this.pipeGap - 200) + 100;
            
            this.pipes.push({
                x: this.canvas.width,
                gapY: gapPosition,
                gapHeight: this.pipeGap,
                width: this.pipeWidth,
                counted: false
            });
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= 2;
            
            // Check collision
            if (this.bird.x + this.bird.size > pipe.x && 
                this.bird.x < pipe.x + pipe.width) {
                if (this.bird.y < pipe.gapY || 
                    this.bird.y + this.bird.size > pipe.gapY + pipe.gapHeight) {
                    this.gameOver();
                    return;
                }
            }
            
            // Score points
            if (!pipe.counted && pipe.x < this.bird.x) {
                this.score++;
                pipe.counted = true;
            }
            
            // Remove off-screen pipes
            if (pipe.x < -pipe.width) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    gameLoop() {
        if (!this.running) return;
        
        this.update();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bird
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
        this.ctx.rotate(Math.min(Math.max(this.bird.velocity * 0.05, -0.5), 0.5));
        
        this.ctx.fillStyle = 'yellow';
        this.ctx.beginPath();
        this.ctx.arc(-this.bird.size/2, -this.bird.size/2, this.bird.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird eye
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(0, -this.bird.size/2, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Draw pipes
        this.pipes.forEach(pipe => {
            this.ctx.fillStyle = '#2ECC71';
            
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, 
                            pipe.width, this.canvas.height - (pipe.gapY + pipe.gapHeight));
        });
        
        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 5;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(this.score, this.canvas.width/2, 50);
        this.ctx.fillText(this.score, this.canvas.width/2, 50);
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    gameOver() {
        this.running = false;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
    }
    
    cleanup() {
        this.running = false;
        document.removeEventListener('keydown', this.handleKeyPress);
    }
}
class CarGame {
    constructor(canvas, ctx) {
        // Canvas setup
        this.canvas = canvas;
        this.ctx = ctx;
        this.running = true;
        
        // Road properties
        this.roadWidth = canvas.width;
        this.roadHeight = canvas.height;
        this.stripeWidth = 15;
        this.stripeGap = 30;
        this.stripeSpeed = 5;
        this.stripes = [];
        
        // Car properties
        this.carWidth = 80;
        this.carHeight = 160;
        this.carX = canvas.width / 2;
        this.carY = canvas.height - 100;
        this.carSpeed = 0;
        this.carRotation = 0;
        this.maxRotation = 45;
        this.acceleration = 0.2;
        this.deceleration = 0.1;
        this.maxSpeed = 12;
        
        // Obstacle properties
        this.obstacles = [];
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnRate = 120;
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        
        // Controls
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false
        };
        
        // Initialize stripes
        this.initStripes();
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // Start game loop
        this.gameLoop();
    }

    initStripes() {
        const numStripes = Math.ceil(this.roadHeight / (this.stripeWidth + this.stripeGap)) + 1;
        for (let i = 0; i < numStripes; i++) {
            this.stripes.push(i * (this.stripeWidth + this.stripeGap));
        }
    }

    handleKeyDown(event) {
        if (this.keys.hasOwnProperty(event.key.toLowerCase())) {
            this.keys[event.key.toLowerCase()] = true;
        }
    }

    handleKeyUp(event) {
        if (this.keys.hasOwnProperty(event.key.toLowerCase())) {
            this.keys[event.key.toLowerCase()] = false;
        }
    }

    updateCar() {
        // Update speed
        if (this.keys.w) {
            this.carSpeed = Math.min(this.carSpeed + this.acceleration, this.maxSpeed)*2;
        } else if (this.keys.s) {
            this.carSpeed = Math.max(this.carSpeed - this.acceleration, -this.maxSpeed/2);
        } else {
            if (this.carSpeed > 0) {
                this.carSpeed = Math.max(0, this.carSpeed - this.deceleration);
            } else if (this.carSpeed < 0) {
                this.carSpeed = Math.min(0, this.carSpeed + this.deceleration);
            }
        }

        // Update rotation
        if (this.keys.a) {
            this.carRotation = Math.max(this.carRotation - 3, -this.maxRotation);
	this.carSpeed = Math.min(this.carSpeed + this.acceleration, this.maxSpeed);
        } else if (this.keys.d) {
            this.carRotation = Math.min(this.carRotation + 3, this.maxRotation);
	this.carSpeed = Math.min(this.carSpeed + this.acceleration, this.maxSpeed);
        } else {
            // Return to straight position
            if (this.carRotation > 0) {
                this.carRotation = Math.max(0, this.carRotation - 2);
            } else if (this.carRotation < 0) {
                this.carRotation = Math.min(0, this.carRotation + 2);
            }
        }

        // Update position
        const radians = this.carRotation * Math.PI / 180;
        this.carX += Math.sin(radians) * this.carSpeed;
        
        // Keep car in bounds
        this.carX = Math.max(this.carWidth/2, Math.min(this.carX, this.canvas.width - this.carWidth/2));
    }

    updateStripes() {
        for (let i = 0; i < this.stripes.length; i++) {
            this.stripes[i] += this.stripeSpeed;
            if (this.stripes[i] > this.roadHeight) {
                this.stripes[i] = -this.stripeWidth;
            }
        }
    }

    spawnObstacle() {
        const obstacle = {
            x: Math.random() * (this.canvas.width - this.carWidth) + this.carWidth/2,
            y: -this.carHeight,
            width: this.carWidth,
            height: this.carHeight,
            speed: 2 + Math.random() * 2
        };
        this.obstacles.push(obstacle);
    }

    updateObstacles() {
        this.obstacleSpawnTimer++;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnRate) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += obstacle.speed;

            // Check collision
            if (this.checkCollision(obstacle)) {
                this.gameOver = true;
            }

            // Remove off-screen obstacles
            if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
                this.score += 10;
            }
        }
    }

    checkCollision(obstacle) {
        const carLeft = this.carX - this.carWidth/2;
        const carRight = this.carX + this.carWidth/2;
        const carTop = this.carY - this.carHeight/2;
        const carBottom = this.carY + this.carHeight/2;

        return !(carLeft > obstacle.x + obstacle.width ||
                carRight < obstacle.x ||
                carTop > obstacle.y + obstacle.height ||
                carBottom < obstacle.y);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stripes
        this.ctx.fillStyle = 'white';
        for (const stripe of this.stripes) {
            this.ctx.fillRect(this.canvas.width/2 - this.stripeWidth/2, 
                            stripe, this.stripeWidth, this.stripeWidth);
        }

        // Draw obstacles
        this.ctx.fillStyle = 'blue';
        for (const obstacle of this.obstacles) {
            this.ctx.fillRect(obstacle.x - obstacle.width/2, 
                            obstacle.y, obstacle.width, obstacle.height);
        }

        // Draw car
        this.ctx.save();
        this.ctx.translate(this.carX, this.carY);
        this.ctx.rotate(this.carRotation * Math.PI / 180);
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(-this.carWidth/2, -this.carHeight/2, 
                         this.carWidth, this.carHeight);
        this.ctx.restore();

        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, 
                            this.canvas.width/2, this.canvas.height/2 + 40);
        }
    }

    gameLoop() {
        if (!this.running) return;

        if (!this.gameOver) {
            this.updateCar();
            this.updateStripes();
            this.updateObstacles();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    cleanup() {
        this.running = false;
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}

class SnakeGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.running = true;
        
        // Grid settings
        this.gridSize = 20;
        this.cols = Math.floor(canvas.width / this.gridSize);
        this.rows = Math.floor(canvas.height / this.gridSize);

        // Snake properties
        this.snake = [{
            x: Math.floor(this.cols / 2),
            y: Math.floor(this.rows / 2)
        }];
        this.direction = 'right';
        this.nextDirection = 'right';

        // Game properties
        this.food = this.generateFood();
        this.score = 0;
        this.speed = 150;
        this.lastUpdate = 0;

        // Bind keyboard events
        this.handleKeyPress = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.handleKeyPress);

        // Start game loop
        this.gameLoop();
    }

    handleKeyPress(event) {
        const directions = {
            ArrowUp: 'up',
            ArrowDown: 'down',
            ArrowLeft: 'left',
            ArrowRight: 'right',
            w: 'up',
            s: 'down',
            a: 'left',
            d: 'right'
        };

        const newDirection = directions[event.key];
        if (newDirection) {
            const opposites = {
                up: 'down',
                down: 'up',
                left: 'right',
                right: 'left'
            };

            if (this.snake.length === 1 || newDirection !== opposites[this.direction]) {
                this.nextDirection = newDirection;
            }
        }
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    update(timestamp) {
        if (!this.running) return;

        if (timestamp - this.lastUpdate > this.speed) {
            this.lastUpdate = timestamp;
            
            // Update direction
            this.direction = this.nextDirection;

            // Calculate new head position
            const head = { ...this.snake[0] };
            switch (this.direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }

            // Check collision with walls
            if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
                this.gameOver();
                return;
            }

            // Check collision with self
            if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                this.gameOver();
                return;
            }

            // Add new head
            this.snake.unshift(head);

            // Check food collision
            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += 10;
                this.food = this.generateFood();
                this.speed = Math.max(50, 150 - Math.floor(this.score / 100) * 10);
            } else {
                this.snake.pop();
            }
        }
    }

    gameLoop(timestamp) {
        if (!this.running) return;

        this.update(timestamp);

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#00ff00' : '#008800';
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, 
                            this.gridSize - 1, this.gridSize - 1);
        });

        // Draw food
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, 
                         this.gridSize - 1, this.gridSize - 1);

        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameOver() {
        this.running = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
    }

    cleanup() {
        this.running = false;
        document.removeEventListener('keydown', this.handleKeyPress);
    }
}

// Kod inicjalizujący gry
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const menuModal = document.getElementById('menuModal');
    const backButton = document.getElementById('backToMenuBtn');
    const scoreDisplay = document.getElementById('scoreDisplay');
    
    // Ustawienia canvas
    canvas.width = 900;
    canvas.height = 800;
    
    let currentGame = null;
    
    // Ukryj elementy na start
    canvas.style.display = 'none';
    backButton.style.display = 'none';
    scoreDisplay.style.display = 'none';

    // Event Listeners dla przycisków
    document.getElementById('snakeBtn').addEventListener('click', () => {
        console.log('Starting Snake');
        startGame('snake');
    });

    document.getElementById('flappyBirdBtn').addEventListener('click', () => {
        console.log('Starting Flappy Bird');
        startGame('flappyBird');
    });

    document.getElementById('breakoutBtn').addEventListener('click', () => {
        console.log('Starting Breakout');
        startGame('breakout');
    });

    document.getElementById('carBtn').addEventListener('click', () => {
        console.log('Starting Car Game');
        startGame('car');
    });

    backButton.addEventListener('click', stopGame);

    // Funkcja startująca grę
    function startGame(gameType) {
        canvas.style.display = 'block';
        menuModal.style.display = 'none';
        backButton.style.display = 'block';
        scoreDisplay.style.display = 'block';

        if (currentGame) {
            currentGame.cleanup();
        }

        switch(gameType) {
            case 'snake':
                currentGame = new SnakeGame(canvas, ctx);
                break;
            case 'flappyBird':
                currentGame = new FlappyBirdGame(canvas, ctx);
                break;
            case 'breakout':
                currentGame = new Breakout(canvas, ctx);
                break;
            case 'car':
                currentGame = new CarGame(canvas, ctx);
                break;
        }

        // Aktualizuj wyświetlanie wyniku
        if (currentGame) {
            const updateScore = () => {
                if (currentGame && currentGame.running) {
                    scoreDisplay.textContent = `Score: ${currentGame.score}`;
                    requestAnimationFrame(updateScore);
                }
            };
            updateScore();
        }
    }

    // Funkcja zatrzymująca grę
    function stopGame() {
        if (currentGame) {
            currentGame.cleanup();
            currentGame = null;
        }
        canvas.style.display = 'none';
        menuModal.style.display = 'flex';
        backButton.style.display = 'none';
        scoreDisplay.style.display = 'none';
    }

    // Dodaj obsługę klawisza Escape do powrotu do menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            stopGame();
        }
    });

    // Dodaj efekt hover dla przycisków
    const gameButtons = document.querySelectorAll('.game-btn');
    gameButtons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseout', () => {
            button.style.transform = 'scale(1)';
        });
    });

    // Pokaż menu na start
    menuModal.style.display = 'flex';
});