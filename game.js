requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const CONFIG = {
	padDeadZone: 0.2,
};

const PLAYER = document.getElementById('player');
const DEBUG = document.getElementById('debug');
const MAIN = document.querySelector('main');
let bullets = [];
let enemies = document.querySelectorAll('ennemy');
let lastUpdates=null;

const BUTTONS = [
	'A',
	'B',
	'X',
	'Y',
	'LB',
	'RB',
	'LT',
	'RT',
	'back',
	'start',
	'LJ',
	'RJ',
	'Up',
	'Down',
	'Left',
	'Right',
];

function update(time) {
	let fps = 60;
	if (lastUpdates === null) return gameInit(time);
	let deltaTime = time - lastUpdates[0];
	lastUpdates.unshift(time);
	if (lastUpdates.length > 60){
		let old = lastUpdates.pop();
		fps = 60000 / (time - old);
	} 
	DEBUG.innerHTML = `
    Left : ${PLAYER.offsetLeft}<br>
    Top : ${PLAYER.offsetTop}<br>
	Fps : ${parseFloat(fps).toFixed(2)}<br>
	Time : ${Math.round(time/1000)}<br>`;
	const PADS = navigator.getGamepads();
	if (!PADS[0]){
		DEBUG.innerHTML += `
		CONTROLLER : <br>
		Disconnected`;
		return requestAnimationFrame(update);
	}
		
	let controller = PADS[0];
	updatePlayerPosition(controller, deltaTime);
	getButtons(controller);
	moveBullets(deltaTime);
	moveEnemies(deltaTime);
	checkPlayerEnemiesCollisions();
	checkBulletsEnemiesCollisions();
	requestAnimationFrame(update);
}

function updatePlayerPosition(controller, deltaTime) {
	DEBUG.innerHTML += `
    CONTROLLER : <br>
    X : ${controller.axes[0]}<br>
    Y : ${controller.axes[1]}<br>
    `;
	if (
		controller.axes[0] > CONFIG.padDeadZone ||
		controller.axes[0] < -CONFIG.padDeadZone
	) {
		PLAYER.dataset.posx =
			Number(PLAYER.dataset.posx) +
			Number(controller.axes[0]) * Number(PLAYER.dataset.speed * deltaTime);
		if (controller.axes[0]<0) PLAYER.classList.add("turnedLeft");
		else PLAYER.classList.remove("turnedLeft");
	}
	if (
		controller.axes[1] > CONFIG.padDeadZone ||
		controller.axes[1] < -CONFIG.padDeadZone
	) {
		PLAYER.dataset.posy =
			Number(PLAYER.dataset.posy) +
			Number(controller.axes[1]) * Number(PLAYER.dataset.speed * deltaTime);
	}
	if (PLAYER.dataset.posx < PLAYER.offsetWidth/2) PLAYER.dataset.posx = PLAYER.offsetWidth/2;
	if (PLAYER.dataset.posy < PLAYER.offsetHeight/2) PLAYER.dataset.posy = PLAYER.offsetHeight/2;
	if (PLAYER.dataset.posx > MAIN.offsetWidth - PLAYER.offsetWidth/2) PLAYER.dataset.posx = MAIN.offsetWidth - PLAYER.offsetWidth/2;
	if (PLAYER.dataset.posy > MAIN.offsetHeight - PLAYER.offsetHeight/2) PLAYER.dataset.posy = MAIN.offsetHeight - PLAYER.offsetHeight/2;
	PLAYER.style.left = `${PLAYER.dataset.posx - PLAYER.offsetWidth/2}px`;
	PLAYER.style.top = `${PLAYER.dataset.posy - PLAYER.offsetHeight/2}px`;
}

function getButtons(controller) {
	controller.buttons.forEach((button, index) => {
		if (!button.pressed) return;
		switch (BUTTONS[index]) {
			case 'A':
				return playerFire(controller.axes[0]*Number(PLAYER.dataset.speed)*PLAYER.dataset.shotfriction, PLAYER.dataset.shotspeed);
			case 'B':
				return playerFire(PLAYER.dataset.shotspeed, controller.axes[1]*Number(PLAYER.dataset.speed)*PLAYER.dataset.shotfriction);
			case 'X':
				return playerFire(- PLAYER.dataset.shotspeed, controller.axes[1]*Number(PLAYER.dataset.speed)*PLAYER.dataset.shotfriction);
			case 'Y':
				return playerFire(controller.axes[0]*Number(PLAYER.dataset.speed)*PLAYER.dataset.shotfriction, - PLAYER.dataset.shotspeed);
			case 'start':
				return console.log('pause');
			default:
				console.log(`unmapped button : ${BUTTONS[index]}`);
		}
	});
}

function playerFire(speedx, speedy) {
	if (Date.now() < Number(PLAYER.dataset.lastshot) + 1000 / Number(PLAYER.dataset.rate)) return;
	PLAYER.dataset.lastshot = Date.now();
	let newBullet = document.createElement('img');
	newBullet.src = 'bullet.svg';
	newBullet.dataset.posx = Number(PLAYER.dataset.posx) + 25;
	newBullet.dataset.posy = PLAYER.dataset.posy;
	newBullet.dataset.speedx = speedx;
	newBullet.dataset.speedy = speedy;
	newBullet.className = 'bullet';
	newBullet.dataset.damage=25;
	bullets.push(MAIN.appendChild(newBullet));
}

function moveBullets(deltaTime) {	
	bullets.forEach((bullet, index) => {
		bullet.dataset.posx =
			(Number(bullet.dataset.posx) + Number(bullet.dataset.speedx) * deltaTime);
		bullet.dataset.posy =
			(Number(bullet.dataset.posy) + Number(bullet.dataset.speedy) * deltaTime);
		bullet.style.left = `${Number(bullet.dataset.posx)-Number(bullet.offsetWidth)/2 }px`;
		bullet.style.top = `${Number(bullet.dataset.posy)-Number(bullet.offsetHeight)/2 }px`;
		if (
			bullet.dataset.posx > MAIN.offsetWidth||
			bullet.dataset.posx < 0 ||
			bullet.dataset.posy > MAIN.offsetHeight||
			bullet.dataset.posy < 0
		) {
			bullets.splice(index,1);
			bullet.remove();
		}
	});
}

function moveEnemies(deltaTime) {
	enemies.forEach((enemy, index) => {
		enemy.dataset.posx =
			(Number(enemy.dataset.posx) + Number(enemy.dataset.speedx) * deltaTime);
		enemy.dataset.posy =
			(Number(enemy.dataset.posy) + Number(enemy.dataset.speedy) * deltaTime);
		enemy.style.left = enemy.dataset.posx + 'px';
		enemy.style.top = enemy.dataset.posy + 'px';

		if ((enemy.dataset.posx > MAIN.offsetWidth - enemy.offsetWidth && enemy.dataset.speedx>0)|| enemy.dataset.posx < 0 && enemy.dataset.speedx<0){
			console.log("boink");
			enemy.dataset.speedx*=-1;
			enemy.classList.toggle("turnedLeft");
		} 
		
		if((enemy.dataset.posy > MAIN.offsetHeight - enemy.offsetHeight && enemy.dataset.speedy>0)|| enemy.dataset.posy < 0 && enemy.dataset.speedy<0){
			console.log("boing");
			enemy.dataset.speedy*=-1;
		}		
	});
}

function checkPlayerEnemiesCollisions(){	
	enemies=document.querySelectorAll('.enemy');
	enemies.forEach(enemy=>{
		checkRoundCollision(PLAYER, enemy);
	})
}

function checkBulletsEnemiesCollisions(){	
	let enemies=document.querySelectorAll('.enemy');
	bullets.forEach((bullet, index)=>{
		enemies.forEach(enemy=>{
			if(checkRoundCollision(bullet, enemy)){
				enemy.dataset.life-=bullet.dataset.damage
				bullets.splice(index,1);
				bullet.remove();
				if (Number(enemy.dataset.life)<=0){
					enemy.remove();
				}
			}
		})
	})
	
}

function checkRoundCollision(firstObject, secondObject){
	let hitCircle1 = {
		radius: firstObject.offsetWidth/2, 
		x: Number(firstObject.dataset.posx), 
		y: Number(firstObject.dataset.posy)
	};
	let hitCircle2 = {
		radius: secondObject.offsetWidth/2, 
		x: Number(secondObject.dataset.posx), 
		y: Number(secondObject.dataset.posy)
	};

	let dx = hitCircle1.x - hitCircle2.x;
	let dy = hitCircle1.y - hitCircle2.y;
	let distance = Math.sqrt(dx * dx + dy * dy);
	return (distance < hitCircle1.radius + hitCircle2.radius);
}

function checkSquareCollision(firstObject, secondObject){
	return ( 
		!(firstObject.offsetLeft + firstObject.offsetWidth < secondObject.offsetLeft // 1 trop à gauche
		|| secondObject.offsetLeft + secondObject.offsetWidth < firstObject.offsetLeft // 1 trop à droite
	    || firstObject.offsetTop + firstObject.offsetHeight < secondObject.offsetTop // 1 trop haut
		|| secondObject.offsetTop + secondObject.offsetHeight < firstObject.offsetTop // 1 trop bas
		)
	);
}

function gameInit(time){
	console.log("init");
	lastUpdates = [time];
	requestAnimationFrame(update);
}

export function spawnEnemy (channel, sender, msg, self){
	let newEnemy = document.createElement('img');
	newEnemy.src = 'enemy.svg';
	newEnemy.dataset.posx = Math.floor(Math.random()*(MAIN.offsetWidth-200))+100;
	newEnemy.dataset.posy = Math.floor(Math.random()*(MAIN.offsetHeight-200))+100;
	newEnemy.dataset.speedx = Math.random()-0.5;
	newEnemy.dataset.speedy = Math.random()-0.5;
	newEnemy.className = 'enemy';
	if (newEnemy.dataset.speedx<0) newEnemy.classList.add("turnedLeft");
	newEnemy.dataset.damage=25;
	newEnemy.dataset.life=100;
	newEnemy.dataset.viewer=sender['display-name'];
	let size=Math.floor(Math.random()*40)+20
	newEnemy.dataset.size=size;
	newEnemy.width=size;
	MAIN.appendChild(newEnemy);
}


addEventListener("load",()=>requestAnimationFrame(update));
