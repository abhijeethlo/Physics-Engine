const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const BALLZ = [];

let x = 100;
let y = 100;
let x2 = 200;
let y2 = 300;

let LEFT, UP, RIGHT, DOWN;


class ball{
    constructor (x, y, r){
        this.x = x;
        this.y = y;
        this.r = r;
        this.player = false;
        BALLZ.push(this);
    }
    drawBall() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
}
}

function keyControl(b){
// Listen for key presses
canvas.addEventListener('keydown', function(e){
if(e.keyCode === 37){
    LEFT = true;
} 
if(e.keyCode === 38){
    UP = true;
}
if(e.keyCode === 39){
    RIGHT = true;
}
if(e.keyCode === 40){
    DOWN = true;
}
}); 

canvas.addEventListener('keyup', function(e){
if(e.keyCode === 37){
    LEFT = false;
} 
if(e.keyCode === 38){
    UP = false;
}
if(e.keyCode === 39){
    RIGHT = false;
}
if(e.keyCode === 40){
    DOWN = false;
}
}); 


if(LEFT){
    b.x--;
}
if(UP){
    b.y--;
}
if(RIGHT){
    b.x++;
}
if(DOWN){
    b.y++;
}

}
 




function mainLoop() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);



BALLZ.forEach((b) =>{
    b.drawBall();
    if(b.player){
        keyControl(b)
    }
});
  requestAnimationFrame(mainLoop);
}

let ball1 = new ball(200, 200, 30);
let ball2 = new ball(300, 300, 20);
ball2.player = true;

requestAnimationFrame(mainLoop);