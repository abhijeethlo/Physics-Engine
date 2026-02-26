const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const BALLZ = [];

let LEFT, UP, RIGHT, DOWN;
let friction = 0.03;


//a class Vector with basic vector operations
class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2)
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    //returns a vector with same direction and 1 length
    unit(){
        if(this.mag() === 0){
            return new Vector(0,0);
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    //returns a perpendicular normal vector
    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    //returns the length of a vectors projection onto the other one
    static dot(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
}

class Ball{
    constructor(x, y, r, m){
        this.pos = new Vector(x,y);
        this.r = r;
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
            }
        else {
            this.inv_m = 1 / this.m;
            }
        this.elasticity = 1;
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.acceleration = 0.5;
        this.player = false;
        BALLZ.push(this);
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.closePath();
    }

    display(){
        this.vel.drawVec(this.pos.x, this.pos.y, 10, "green");
        ctx.fillStyle = "black";
        ctx.fillText("m = "+this.m, this.pos.x-10, this.pos.y-5);
        ctx.fillText("e = "+this.elasticity, this.pos.x-10, this.pos.y+5);
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.pos = this.pos.add(this.vel);
    }
}

function keyControl(b){
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
        b.acc.x = -b.acceleration;
    }
    if(UP){
        b.acc.y = -b.acceleration;
    }
    if(RIGHT){
        b.acc.x = b.acceleration;
    }
    if(DOWN){
        b.acc.y = b.acceleration;
    }
    if(!LEFT && !RIGHT){
        b.acc.x = 0;
    }
    if(!UP && !DOWN){
        b.acc.y = 0;
    }
  
}


function round(number, precision){
    let factor = 10**precision;
    return Math.round(number * factor) / factor;
}

//collision detection between two balls
function coll_det_bb(b1, b2){
    if(b1.r + b2.r >= b2.pos.subtr(b1.pos).mag()){
        return true;
    } else {
        return false;
    }
}

//penetration resolution
//repositions the balls based on the penetration depth and the collision normal
function pen_res_bb(b1, b2){
    let dist = b1.pos.subtr(b2.pos);
    let pen_depth = b1.r + b2.r - dist.mag();
      //dividing the penetration depth in the ratio of the inverse masses
    let pen_res = dist.unit().mult(pen_depth / (b1.inv_m + b2.inv_m));
    b1.pos = b1.pos.add(pen_res.mult(b1.inv_m));
    b2.pos = b2.pos.add(pen_res.mult(-b2.inv_m));
}

//collision resolution
//calculates the balls new velocity vectors after the collision
function coll_res_bb(b1, b2){

	//collision normal vector
    let normal = b1.pos.subtr(b2.pos).unit();

    //relative velocity vector
    let relVel = b1.vel.subtr(b2.vel);

    //separating velocity - relVel projected onto the collision normal vector
    let sepVel = Vector.dot(relVel, normal);

    //the projection value after the collision (multiplied by -1 & elasticity)
    let new_sepVel = -sepVel*Math.min(b1.elasticity, b2.elasticity);

    //the difference between the new and the original sep.velocity value
    let vsep_diff = new_sepVel - sepVel;

    //dividing the impulse value in the ration of the inverse masses
    //and adding the impulse vector to the original vel. vectors
    //according to their inverse mass
    let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
    let impulseVec = normal.mult(impulse);

    //adding the separating velocity vector to the original vel. vector
    b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m));
    

    //adding its opposite to the other balls original vel. vector
    b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m));
}

function momentum_display(){
    let momentum = Ball1.vel.add(Ball2.vel).mag();
    ctx.fillText("Momentum: "+round(momentum, 4), 500, 330);
}

function mainLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    BALLZ.forEach((b, index) => {
        b.drawBall();
        if (b.player){
            keyControl(b);
        }
        for(let i = index+1; i<BALLZ.length; i++){
            if(coll_det_bb(BALLZ[index], BALLZ[i])){
                pen_res_bb(BALLZ[index], BALLZ[i]);
                coll_res_bb(BALLZ[index], BALLZ[i]);
            }
        }
        b.display();
        b.reposition();
    });
    momentum_display();

    requestAnimationFrame(mainLoop);
}

let Ball1 = new Ball(200, 200, 30, 6);
let Ball2 = new Ball(300, 250, 40, 100);
Ball2.elasticity = 0.8;
let Ball3 = new Ball(250, 220, 35, 50);
Ball3.elasticity = 0.7;
let Ball4 = new Ball(300, 300, 30, 7);
Ball4.elasticity = 0.6;
let Ball5 = new Ball(350, 350, 40, 5);
Ball5.elasticity = 0.5;
let Ball6 = new Ball(450, 420, 35, 3);
Ball6.elasticity = 0.4;
let Ball7 = new Ball(400, 400, 30, 8);
Ball7.elasticity = 0.3;
let Ball8 = new Ball(100, 250, 40, 9);
Ball8.elasticity = 0.2;
let Ball9 = new Ball(150, 220, 35, 1);
Ball9.elasticity = 0.1;
Ball1.player = true;

requestAnimationFrame(mainLoop);
