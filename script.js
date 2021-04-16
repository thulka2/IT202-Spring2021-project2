let player = { x: 50, y: 50, speed: 10, w: 50, h: 50, type: "player" };
let gameInfo = { gameStarted: false, gameOver: false, lives: 3, score: 0, level: 1, type: "game" }
let enemies;
let benefit;
let canvas;





const randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const startGame = () => {
    document.querySelector('#home').classList.add("screen");
    document.querySelector('#game').classList.remove("screen");
    gameInfo.gameStarted = true;

}

const gameOver = () => {
    gameInfo.gameOver = true;
    gameInfo.gameStarted = false;
    document.querySelector('#game').classList.add("screen");
    document.querySelector('#over').classList.remove("screen");
    document.querySelector('#score').innerHTML = `Final score: ${gameInfo.score}`;
    document.querySelector('#level').innerHTML = `Highest level: ${gameInfo.level}`;

}


const clickHandler = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS 13+
      
    DeviceOrientationEvent.requestPermission()
    .then(response => {
        if (response == 'granted') {
            startGame();
            window.addEventListener('deviceorientation', (event) => {
                //document.querySelector('#orientationinfo').innerHTML = `alpha: ${event.alpha} \nbeta: ${event.beta} gamma: ${event.gamma}`;
                document.querySelector('#orientationinfo').innerHTML = `gamma: ${parseInt(event.gamma)}`;
                if (gameInfo.gameStarted) {
                    if (event.gamma > 15 && event.gamma < 80) {
                        if (player.y < (screen.availHeight - player.speed)) {
                            player.y += player.speed / 2;
                            document.querySelector('#orientationinfo').innerHTML = "moving down";
                        }
                    } else if (event.gamma < -10 && event.gamma > -80) {
                        if (player.y > player.speed) {
                            player.y -= player.speed / 2;
                            document.querySelector('#orientationinfo').innerHTML = "moving up";

                        }
                    }
                }
            }, false);
        }
    }).catch(console.error);
    } else {
        startGame();
    }

}



document.addEventListener("DOMContentLoaded", () => {


   

    document.querySelector("#playBtn").addEventListener("click", () => {

        let canvas = document.querySelector("#html-canvas");
        gameInfo.canvas = canvas;
        // change screen width and height for mobile devices
        if (screen.width > 600 ) {
            // desktop
            canvas.width = 900;
            canvas.height = 600;
        } else {
            // canvas.width = screen.availWidth * .8;
            // canvas.height = screen.availHeight * .7;
            canvas.width = screen.availWidth;
            canvas.height = screen.availHeight;
        }
        
        let context = canvas.getContext("2d");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';


        const wafPic = new Image(380, 380);
        wafPic.src = "images/waffle.png"
        wafPic.onload = () => {
            context.drawImage(wafPic, 200, 0, 100, 100);
        }

        const demPic = new Image(380, 360);
        demPic.src = "images/demogorgon.png"
        demPic.onload = () => {
            context.drawImage(demPic, 400, 0, 100, 100);
        }

        const playerPic = new Image(1610, 253);
        playerPic.src = "images/playerSpritesEdit.png"
        playerPic.onload = () => {
            context.drawImage(playerPic, 0, 0, 100, 100);

        }

        const bgPic = new Image(785, 455);
        bgPic.src = "images/forest.jpg"
        bgPic.onload = () => {
            context.drawImage(bgPic, 0, 0, canvas.width, canvas.height);
        }


        let numColumns = 10;
        let frameWidth = playerPic.width / numColumns;;
        let frameHeight = playerPic.height;
        let currentFrame = 0;
        let counter = 0;
        let frameRate = 6;
        player.w = frameWidth * .3;
        player.h = frameHeight * .3;
        player.y = canvas.height / 2;

        enemies = [{ x: canvas.width + 100, y: randomInt(0, canvas.height / 2), speed: 5, w: 50, h: 47.368421052632, type: "harm" }];
        benefit = { x: canvas.width + 3000, y: randomInt(0, canvas.height - 100), speed: 8, w: 30, h: 30, type: "benefit" }



        // shows levels, score, and level onto canvas
        const drawGameInfo = () => {
            context.font = "25px Teko";
            context.fillStyle = "red";
            context.textAlign = "right";
            context.fillText(`Score: ${gameInfo.score}`, canvas.width - 15, 25);
            context.fillText(`Lives: ${gameInfo.lives}`, canvas.width - 15, 50);
            context.fillText(`Level: ${gameInfo.level}`, canvas.width - 15, 75);

        };




        const drawHarm = (x, y, w, h) => {
            context.drawImage(demPic, x, y, w, h);

        }

        const drawBenefit = (x, y, w, h) => {
            context.drawImage(wafPic, x, y, w, h);
        }


        const drawPlayer = () => {
            if (counter % frameRate == 0) {
                currentFrame++;

            }
            if (currentFrame > numColumns - 1) {
                currentFrame = 0;
            }
            context.drawImage(playerPic, currentFrame * frameWidth, 0, frameWidth, frameHeight, player.x, player.y, player.w, player.h);
        }



        const areColliding = (obj1, obj2) => {


            if (obj1.type == "harm") {
                if (obj2.type != "game") {
                    if (obj1.x < obj2.x + obj2.w && obj1.x + obj1.w > obj2.x && obj1.y < obj2.y + obj2.h && obj1.y + obj1.h > obj2.y) {
                        // subtract lives
                        gameInfo.lives--;
                        // drawDamage();
                        if (gameInfo.lives < 0) {
                            gameInfo.gameOver = true;
                        }

                        return true;
                    }
                } else {
                    if (obj1.x < 0) {
                        gameInfo.score++; // player avoided the harm object 
                        if (gameInfo.score % 15 == 0) {
                            console.log("increasing level");
                            gameInfo.level++;
                            // add an enemy and increase the speeds of all enemies 
                            enemies.push({ x: canvas.width + randomInt(100, 500), y: randomInt(0, canvas.height / 1.33), speed: enemies[0].speed, w: enemies[0].w, h: enemies[0].h, type: "harm" })
                            // increase speed of all enemies by 15% 
                            enemies.forEach((harm) => {
                                harm.speed *= 1.15;
                            });
                        }
                        return true;
                    }
                }
            }

            if (obj1.type == "benefit") {
                if (obj2.type != "game") {
                    if (obj1.x < obj2.x + obj2.w && obj1.x + obj1.w > obj2.x && obj1.y < obj2.y + obj2.h && obj1.y + obj1.h > obj2.y) {
                        // add a life 
                        gameInfo.lives++;
                        return true;
                    }
                } else {
                    if (obj1.x < 0) {
                        // respawn benefit off screen
                        return true;
                    }
                }
            }


            return false;


        }


        const draw = () => {
            if(gameInfo.gameStarted) {

            
            counter++;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bgPic, 0, 0, canvas.width, canvas.height);

            drawGameInfo();
            drawPlayer();
            // harm object code 
            enemies.forEach((harm) => {
                // if the harm object touches the wall or the player then respawn it off the screen 
                if (areColliding(harm, player) || areColliding(harm, gameInfo)) {
                    harm.x = canvas.width + randomInt(100, 500);
                    harm.y = randomInt(0, canvas.height - harm.h);
                }
                else {
                    harm.x -= harm.speed;

                }
                drawHarm(harm.x, harm.y, harm.w, harm.h);
            });

            // benefit object code 
            if (areColliding(benefit, gameInfo) || areColliding(benefit, player)) {
                // if the benefit object touches the wall or the player then respawn it off the screen 
                benefit.x = canvas.width + randomInt(3000, 5000 * gameInfo.level);
                benefit.y = randomInt(0, canvas.height - benefit.h);
            } else {
                benefit.x -= benefit.speed;
            }
            drawBenefit(benefit.x, benefit.y, benefit.w, benefit.h);

            }

            // draw if game is not over 
            if (!gameInfo.gameOver) {
                requestAnimationFrame(draw);
            } else {
                gameOver();
            }
        };

        draw();




        document.addEventListener("keydown", (event) => {
            if (gameInfo.gameStarted) {
                switch (event.key) {
                    case 'ArrowDown':
                        if (player.y < canvas.height - player.h - player.speed) {
                            player.y += player.speed;
                        }
                        break;

                    case 'ArrowUp':
                        if (player.y > player.speed) {
                            player.y -= player.speed;
                        }

                        break;
                }
            }
        }, false);

        



    }, false);
}, false);



