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
	if (PLAYER.dataset.posx < 0) PLAYER.dataset.posx = 0;
	if (PLAYER.dataset.posy < 0) PLAYER.dataset.posy = 0;
	if (PLAYER.dataset.posx > 1500) PLAYER.dataset.posx = 1500;
	if (PLAYER.dataset.posy > 800) PLAYER.dataset.posy = 800;
	PLAYER.style.left = `${PLAYER.dataset.posx}px`;
	PLAYER.style.top = `${PLAYER.dataset.posy}px`;
}

function getButtons(controller) {
	controller.buttons.forEach((button, index) => {
		if (!button.pressed) return;
		switch (BUTTONS[index]) {
			case 'A':
				return playerFire(0, 30);
			case 'B':
				return playerFire(30, 0);
			case 'X':
				return playerFire(-30, 0);
			case 'Y':
				return playerFire(0, -30);
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
	MAIN.appendChild(newBullet);
}

function moveBullets() {
	let bullets = document.querySelectorAll('.bullet');
	bullets.forEach(bullet => {
		bullet.dataset.posx =
			Number(bullet.dataset.posx) + Number(bullet.dataset.speedx);
		bullet.dataset.posy =
			Number(bullet.dataset.posy) + Number(bullet.dataset.speedy);
		bullet.style.left = bullet.dataset.posx + 'px';
		bullet.style.top = bullet.dataset.posy + 'px';
		if (
			bullet.dataset.posx > 1600 - bullet.offsetWidth||
			bullet.dataset.posx < 0 ||
			bullet.dataset.posy > 900 - bullet.offsetHeight||
			bullet.dataset.posy < 0
		) {
			bullet.remove();
		}
	});
}
