document.addEventListener('DOMContentLoaded', function() {
    // Podstawowa konfiguracja
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const menuModal = document.getElementById('menuModal');
    const backButton = document.getElementById('backToMenuBtn');
    
    // Ustawienia canvas
    canvas.width = 800;
    canvas.height = 600;
    
    let currentGame = null;
    
    // Ukryj canvas i przycisk powrotu na start
    canvas.style.display = 'none';
    backButton.style.display = 'none';

    // Event Listeners dla przycisków
    document.getElementById('snakeBtn').onclick = function() {
        startGame('snake');
    };

    document.getElementById('flappyBirdBtn').onclick = function() {
        startGame('flappyBird');
    };

    document.getElementById('breakoutBtn').onclick = function() {
        startGame('breakout');
    };

    document.getElementById('carBtn').onclick = function() {
        startGame('car');
    };

    backButton.onclick = function() {
        stopGame();
    };

    // Funkcje zarządzające grami
    function startGame(gameType) {
        canvas.style.display = 'block';
        menuModal.style.display = 'none';
        backButton.style.display = 'block';

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
    }

    function stopGame() {
        if (currentGame) {
            currentGame.cleanup();
            currentGame = null;
        }
        canvas.style.display = 'none';
        menuModal.style.display = 'flex';
        backButton.style.display = 'none';
    }


    class SnakeGame {
        constructor(canvas, ctx) {
            this.canvas = canvas;
            this.ctx = ctx;
            this.running = true;
            
            // Snake properties
            this.snake = [{x: 10, y: 10}];
            this.food = this.generateFood();
            this.direction = 'right';
            this.score = 0;
            
            // Bind keyboard events
            this.handleKeyPress = this.handleKeyPress.bind(this);
            document.addEventListener('keydown', this.handleKeyPress);
            
            // Start game loop
            this.gameLoop();
        }
        
        generateFood() {
            return {
                x: Math.floor(Math.random() * (this.canvas.width / 20)),
                y: Math.floor(Math.random() * (this.canvas.height / 20))
            };
        }
        
        handleKeyPress(event) {
            switch(event.key) {
                case 'w':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 's':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'a':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'd':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        }
        
        update() {
            // Create new head based on direction
            const head = {x: this.snake[0].x, y: this.snake[0].y};
            
            switch(this.direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }
            
            // Check collision with walls
            if (head.x < 0 || head.x >= this.canvas.width/20 || 
                head.y < 0 || head.y >= this.canvas.height/20) {
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
            
            // Check if food is eaten
            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += 10;
                this.food = this.generateFood();
            } else {
                this.snake.pop();
            }
        }
        
        gameLoop() {
            if (!this.running) return;
            
            this.update();
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw snake
            this.ctx.fillStyle = 'green';
            this.snake.forEach(segment => {
                this.ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
            });
            
            // Draw food
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(this.food.x * 20, this.food.y * 20, 18, 18);
            
            // Draw score
            this.ctx.fillStyle = 'black';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Score: ${this.score}`, 10, 30);
            
            setTimeout(() => requestAnimationFrame(() => this.gameLoop()), 100);
        }
        
        gameOver() {
            this.running = false;
            this.ctx.fillStyle = 'black';
            this.ctx.font = '40px Arial';
            this.ctx.fillText('Game Over!', this.canvas.width/2 - 100, this.canvas.height/2);
        }
        
        cleanup() {
            this.running = false;
            document.removeEventListener('keydown', this.handleKeyPress);
        }
    }

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

        // Bricks setup - dopasowane do szerokości canvy
        this.brickRowCount = 6;
        this.brickColumnCount = 10;
        this.brickWidth = (canvas.width - 20) / this.brickColumnCount;
        this.brickHeight = 30;
        this.brickPadding = 2;
        this.brickOffsetTop = 30;
        this.brickOffsetLeft = 10;
        this.bricks = this.createBricks();

        this.score = 0;

        // Mouse tracking
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);

        // Start game loop
        this.gameLoop();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        this.paddle.x = mouseX - this.paddle.width / 2;

        // Keep paddle within canvas bounds
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
            
            // Change ball direction based on where it hits the paddle
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
            
            // Dokładniejsza detekcja kolizji
            const ballLeft = this.ball.x - this.ball.radius;
            const ballRight = this.ball.x + this.ball.radius;
            const ballTop = this.ball.y - this.ball.radius;
            const ballBottom = this.ball.y + this.ball.radius;
            
            const brickLeft = brickX;
            const brickRight = brickX + this.brickWidth;
            const brickTop = brickY;
            const brickBottom = brickY + this.brickHeight;
            
            if (ballRight > brickLeft && 
                ballLeft < brickRight && 
                ballBottom > brickTop && 
                ballTop < brickBottom) {
                
                // Określ kierunek odbicia
                const fromLeft = ballRight - brickLeft;
                const fromRight = brickRight - ballLeft;
                const fromTop = ballBottom - brickTop;
                const fromBottom = brickBottom - ballTop;
                
                // Znajdź najmniejszą głębokość kolizji
                const minDepth = Math.min(fromLeft, fromRight, fromTop, fromBottom);
                
                // Odbij piłkę w odpowiednim kierunku
                if (minDepth === fromLeft || minDepth === fromRight) {
                    this.ball.dx = -this.ball.dx;
                } else {
                    this.ball.dy = -this.ball.dy;
                }
                
                // Dodaj efekt dźwiękowy lub wizualny przy zniszczeniu cegły
                this.createBrickEffect(brickX + this.brickWidth/2, brickY + this.brickHeight/2, brick.color);
                
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
    createBrickEffect(x, y, color) {
    // Efekt wizualny przy zniszczeniu cegły
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.5;
    this.ctx.fill();
    this.ctx.restore();
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
                    this.ctx.strokeStyle = '#FFF';
                    this.ctx.strokeRect(brickX, brickY, this.brickWidth, this.brickHeight);
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


// Car Game ze sterowaniem WSAD
class CarGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.running = true;

        // Car properties
        this.car = {
            x: canvas.width / 2,
            y: canvas.height - 100,
            width: 50,
            height: 80,
            speed: 5 // Stała prędkość
        };

        // Game properties
        this.obstacles = [];
        this.score = 0;
        this.spawnTimer = 0;
        
        // Bind keyboard events
        this.keys = {};
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        // Start game loop
        this.gameLoop();
    }

    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    spawnObstacle() {
        const size = Math.random() * 30 + 20;
        this.obstacles.push({
            x: Math.random() * (this.canvas.width - size),
            y: -size,
            size: size,
            speed: Math.random() * 2 + 2
        });
    }

    update() {
        if (!this.running) return;

        // Update car position based on WSAD keys
        if (this.keys['w'] && this.car.y > 0) {
            this.car.y -= this.car.speed;
        }
        if (this.keys['s'] && this.car.y < this.canvas.height - this.car.height) {
            this.car.y += this.car.speed;
        }
        if (this.keys['a'] && this.car.x > 0) {
            this.car.x -= this.car.speed;
        }
        if (this.keys['d'] && this.car.x < this.canvas.width - this.car.width) {
            this.car.x += this.car.speed;
        }

        // Spawn and update obstacles
        this.spawnTimer++;
        if(this.spawnTimer >= 60) {
            this.spawnTimer = 0;
            this.spawnObstacle();
        }

        // Update obstacles
        for(let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += obstacle.speed;

            // Check collision with simple rectangle collision
            if (this.car.x < obstacle.x + obstacle.size &&
                this.car.x + this.car.width > obstacle.x &&
                this.car.y < obstacle.y + obstacle.size &&
                this.car.y + this.car.height > obstacle.y) {
                this.gameOver();
                return;
            }

            // Remove off-screen obstacles and increase score
            if(obstacle.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
                this.score += 10;
            }
        }
    }

    gameLoop() {
        if (!this.running) return;

        this.update();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw road
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road lines
        this.ctx.strokeStyle = '#FFF';
        this.ctx.setLineDash([20, 20]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width/2, 0);
        this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
        this.ctx.stroke();

        // Draw car (without rotation)
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
        
        // Draw car windows
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.car.x + this.car.width/6, 
                         this.car.y + this.car.height/6,
                         this.car.width * 2/3, 
                         this.car.height/4);

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
        });

        // Draw score
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        requestAnimationFrame(() => this.gameLoop());
    }

    gameOver() {
        this.running = false;
        this.ctx.fillStyle = 'red';
        this.ctx.font = '48px Arial';
        this.ctx.fillText('GAME OVER!', this.canvas.width/2 - 120, this.canvas.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2 - 70, this.canvas.height/2 + 40);
    }

    cleanup() {
        this.running = false;
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}

class FlappyBirdGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.running = true;
        
        // Bird properties
        this.bird = {
            x: 50,
            y: canvas.height / 2,
            velocity: 0,
            gravity: 0.5,
            jump: -10
        };
        
        // Game properties
        this.pipes = [];
        this.score = 0;
        this.pipeSpawnTimer = 0;
        
        // Bind keyboard events
        this.handleKeyPress = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Start game loop
        this.gameLoop();
    }
    
    handleKeyPress(event) {
        if (event.code === 'Space') {
            this.bird.velocity = this.bird.jump;
        }
    }
    
    update() {
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Keep bird in bounds without game over
        if (this.bird.y > this.canvas.height - 20) {
            this.bird.y = this.canvas.height - 20;
            this.bird.velocity = 0;
        }
        if (this.bird.y < 20) {
            this.bird.y = 20;
            this.bird.velocity = 0;
        }
        
        // Spawn new pipes
        this.pipeSpawnTimer++;
        if (this.pipeSpawnTimer >= 150) { // Increased spawn time for wider gaps
            this.pipeSpawnTimer = 0;
            const gap = 250; // Larger gap
            const gapPosition = Math.random() * (this.canvas.height - gap - 200) + 100;
            
            this.pipes.push({
                x: this.canvas.width,
                gapY: gapPosition,
                gapHeight: gap,
                width: 80, // Wider pipes
                counted: false
            });
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= 2;
            
            // Check collision
            if (this.bird.x + 20 > pipe.x && this.bird.x < pipe.x + pipe.width) {
                if (this.bird.y < pipe.gapY || this.bird.y + 20 > pipe.gapY + pipe.gapHeight) {
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
        this.ctx.fillStyle = '#87CEEB'; // Sky blue
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bird
        this.ctx.fillStyle = 'yellow';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pipes
        this.ctx.fillStyle = 'green';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, 
                            pipe.width, this.canvas.height - (pipe.gapY + pipe.gapHeight));
        });
        
        // Draw score
        this.ctx.fillStyle = 'black';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    gameOver() {
        this.running = false;
        this.ctx.fillStyle = 'black';
        this.ctx.font = '48px Arial';
        this.ctx.fillText('Game Over!', this.canvas.width/2 - 100, this.canvas.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2 - 70, this.canvas.height/2 + 40);
    }
    
    cleanup() {
        this.running = false;
        document.removeEventListener('keydown', this.handleKeyPress);
    }
}


});
