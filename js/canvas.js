console.log(gsap);
let c = document.getElementById('c');
let ctx = c.getContext('2d');
let w = c.width = innerWidth;
let h = c.height = innerHeight;
let circle = Math.PI * 2;

let gameEnd = true;
let score = 0;

const start = document.getElementById('start');
const counter = document.querySelector('.counter');
const content = document.querySelector('.content');
const result = document.getElementById('result');

class Component {
    constructor(x,y,r,clr) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.clr = clr;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.clr;
        ctx.arc(this.x,this.y,this.r,0,circle);
        ctx.fill();
        ctx.closePath();
    }
}

class Player extends Component {
    constructor(x,y,r,clr) {
        super(x,y,r,clr);
    }
}

class Enemy extends Component {
    
    constructor(x,y,r,clr,velocity) {
        super(x,y,r,clr);
        this.velocity = velocity;
    }
    update() {
        this.draw();
        this.x += this.velocity.x * 2;
        this.y += this.velocity.y * 2;
    }
}

class Shot extends Component {
    constructor(x,y,r,clr,velocity) {
        super(x,y,r,clr);
        this.velocity = velocity;
    }
    update() {
        this.draw();
        this.x += this.velocity.x * 6;
        this.y += this.velocity.y * 6;
    }
}

class Collision extends Shot {
    constructor(x,y,r,clr,velocity) {
        super(x,y,r,clr,velocity);
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.fillStyle = this.clr;
        ctx.arc(this.x,this.y,this.r,0,circle);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    update() {
        this.draw();
        this.x += this.velocity.x * 0.08;
        this.y += this.velocity.y * 0.08;
        this.alpha -= 0.01;
    }
}

// creation of player
let player;
function init() {
    player = new Player(w/2, h/2, 10, "#fff");
    player.draw();
}

// creation of enemies
let enemies = [];
let number;

function createEnemy() {
    let posX,posY,radius,clr,velocity;
    let random = Math.floor(Math.random() * 2);
    if(random === 0) {
        posX = Math.random() - 0.5 < 0? 0 : w;
        posY = getRandomInRange(0,h);
    }
    else {
        posY = Math.random() - 0.5 < 0? 0 : h;
        posX = getRandomInRange(0,w);
    }
    radius = getRandomInRange(5,30);
    clr = `hsl(${getRandomInRange(0,360)},50%,50%)`;
    velocity = {
        x: getVelocity(posX,posY,w/2,h/2,'x'),
        y: getVelocity(posX,posY,w/2,h/2,'y')
    }
    let enemy = new Enemy(posX,posY,radius,clr,velocity);
    enemy.draw();
    enemies.push(enemy);
}

// creation of shots
let shots = [];
c.addEventListener('mousedown', (event) => {
    let velocity = {
        x: getVelocity(w/2,h/2,event.clientX,event.clientY,'x'),
        y: getVelocity(w/2,h/2,event.clientX,event.clientY,'y')
    }
    let shot = new Shot(w/2,h/2,5,"#fff",velocity);
    shot.draw();
    shots.push(shot);
    event.preventDefault();
});

function getRandomInRange(min,max) {
    return Math.random() * (max - min) + min;
}

function getDistance(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(x2 - x1,2) + Math.pow(y2 - y1,2));
}

function getVelocity(x1,y1,x2,y2,axe) {
    return axe === 'x'? Math.cos(Math.atan2(y2-y1,x2-x1)) : Math.sin(Math.atan2(y2-y1,x2-x1));
}

let collisions = [];
function animate() {
    let id = requestAnimationFrame(animate);
    ctx.fillStyle = `rgba(0,0,0,0.2)`;
    ctx.fillRect(0,0,w,h);
    init();
    enemies.forEach((enemy,index) => {
        shots.forEach((shot,i) => {
            // collision of enemy and shot
            if(getDistance(shot.x,shot.y,enemy.x,enemy.y) - shot.r - enemy.r <= 0) {
                score += Math.floor(enemy.r);
                counter.innerHTML = score;
                shots.splice(i,1);
                // create collisions
                for(let i = 0; i < enemy.r; i++) {
                    let collision = new Collision(enemy.x,enemy.y,Math.random() * 2,enemy.clr,{
                        x: (Math.random() - 0.5) * getRandomInRange(40,80),
                        y: (Math.random() - 0.5) * getRandomInRange(40,80)
                    });
                    collision.draw();
                    collisions.push(collision);
                }

                if(enemy.r < 15) enemies.splice(index,1);
                else {
                    gsap.to(enemy, {
                        r: enemy.r - 10
                    });
                }              
            }
        });
        
        // collision of player and enemy
        if(getDistance(player.x,player.y,enemy.x,enemy.y) - player.r - enemy.r <= 0) {
            cancelAnimationFrame(id);
            gameEnd = true;
            clearInterval(number);
            content.style.display = 'block';
            points.style.display = 'block';
            result.innerHTML = score;
        }
        enemy.update();
    });
    collisions.forEach((collision,index) => {
        collision.alpha <= 0? collisions.splice(index,1) : collision.update();
    });
    shots.forEach((shot,index) => {
        if(shot.x + shot.r < 0 || shot.x - shot.r > w || shot.y + shot.r < 0 || shot.y - shot.r > h) {
            shots.splice(index,1);
        }
        shot.update();
    });
}
animate();

start.addEventListener('click', (event) => {
    content.style.display = 'none';
    gameEnd = false;
    score = 0;
    counter.innerHTML = score;
    result.innerHTML = score;
    shots = [], enemies = [],collisions = [];
    ctx.clearRect(0,0,w,h);
    animate();
    number = setInterval(createEnemy,2000);
    event.preventDefault();
});


