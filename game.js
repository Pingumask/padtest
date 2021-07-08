const CONFIG = {
	padDeadZone: 0.2,
	fps: 30,
};

setInterval(update, 1000 / CONFIG.fps);
const PLAYER = document.getElementById('player');
const DEBUG = document.getElementById('debug');
const MAIN = document.querySelector('main');

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

let bullets = [];

function update() {
	DEBUG.innerHTML = `
    Left : ${PLAYER.offsetLeft}<br>
    Top : ${PLAYER.offsetTop}<br>`;
	const PADS = navigator.getGamepads();
	if (!PADS[0])
		return (DEBUG.innerHTML += `
    CONTROLLER : <br>
    Disconnected
    `);
	let controller = PADS[0];
	updatePlayerPosition(controller);
	getButtons(controller);
	moveBullets();
	moveenemies();
	checkPlayerenemiesCollisions();
	checkBulletsenemiesCollisions();
}

function updatePlayerPosition(controller) {
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
			Number(controller.axes[0]) * Number(PLAYER.dataset.speed);
		if (controller.axes[0]<0) PLAYER.classList.add("turnedLeft");
		else PLAYER.classList.remove("turnedLeft");
	}
	if (
		controller.axes[1] > CONFIG.padDeadZone ||
		controller.axes[1] < -CONFIG.padDeadZone
	) {
		PLAYER.dataset.posy =
			Number(PLAYER.dataset.posy) +
			Number(controller.axes[1]) * Number(PLAYER.dataset.speed);
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
				return playerFire(controller.axes[0]*Number(PLAYER.dataset.speed)*.75, 30);
			case 'B':
				return playerFire(30, controller.axes[1]*Number(PLAYER.dataset.speed)*.75);
			case 'X':
				return playerFire(-30, controller.axes[1]*Number(PLAYER.dataset.speed)*.75);
			case 'Y':
				return playerFire(controller.axes[0]*Number(PLAYER.dataset.speed)*.75, -30);
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

function moveBullets() {	
	bullets.forEach((bullet, index) => {
		bullet.dataset.posx =
			Number(bullet.dataset.posx) + Number(bullet.dataset.speedx);
		bullet.dataset.posy =
			Number(bullet.dataset.posy) + Number(bullet.dataset.speedy);
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

function moveenemies() {
	let enemies = document.querySelectorAll('.enemy');
	enemies.forEach(enemy => {
		enemy.dataset.posx =
			Number(enemy.dataset.posx) + Number(enemy.dataset.speedx);
		enemy.dataset.posy =
			Number(enemy.dataset.posy) + Number(enemy.dataset.speedy);
		enemy.style.left = enemy.dataset.posx + 'px';
		enemy.style.top = enemy.dataset.posy + 'px';
		if (
			enemy.dataset.posx > 1600 - enemy.offsetWidth||
			enemy.dataset.posx < 0
		) enemy.dataset.speedx*=-1;
		
		if(enemy.dataset.posy > 900 - enemy.offsetHeight||
			enemy.dataset.posy < 0
		) enemy.dataset.speedy*=-1;
		
	});
}

function checkPlayerenemiesCollisions(){	
	enemies=document.querySelectorAll('.enemy');
	enemies.forEach(enemy=>{
		checkRoundCollision(PLAYER, enemy);
	})
}

function checkBulletsenemiesCollisions(){	
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
	if (!checkSquareCollision(firstObject,secondObject)) return false;
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
	if (distance < hitCircle1.radius + hitCircle2.radius) {
		//console.log(`Round Collision`)
		return true;
	}
	return false;
}

function checkSquareCollision(firstObject, secondObject){
	if ( firstObject.offsetLeft + firstObject.offsetWidth < secondObject.offsetLeft) return false; // 1 trop à gauche
	if ( secondObject.offsetLeft + secondObject.offsetWidth < firstObject.offsetLeft) return false; // 1 trop à droite
	if ( firstObject.offsetTop + firstObject.offsetHeight < secondObject.offsetTop) return false; // 1 trop haut
	if ( secondObject.offsetTop + secondObject.offsetHeight < firstObject.offsetTop) return false;// 1 trop bas
	//console.log(`Square collision`)
	return true;
}