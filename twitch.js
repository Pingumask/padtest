const twitchCredentials = {
    identity: {
      username: localStorage.getItem('botName'),
      password: localStorage.getItem('twitchOauth')
    },
    channels: [localStorage.getItem('twitchChannel')]
};

const twitchClient = new tmi.client(twitchCredentials);

twitchClient.on('message', onMessageHandler);
twitchClient.on('connected', onConnectedHandler);

twitchClient.connect()
.catch(()=>{window.location.replace("./connect.html");})  

function onMessageHandler(target, context, msg, self) {
    console.log(`%c ${context['display-name']} : ${msg}`,`color:${context.color}`);
    if (self) { return; }     
    if (!msg.startsWith('!')) { return; } 
    const args = msg.split(" ");
    const command = args.shift().substring(1);
    //console.log(context);
    switch(command){
        case "snow":
            document.querySelector('main').classList.toggle('snow');
            break;
        case "spawn":
            let newEnemy = document.createElement('img');
            newEnemy.src = 'enemy.svg';
            newEnemy.dataset.posx = Math.floor(Math.random()*1400)+100;
            newEnemy.dataset.posy = Math.floor(Math.random()*600)+100;
            newEnemy.dataset.speedx = Math.floor(Math.random()*40)-20;
            newEnemy.dataset.speedy = Math.floor(Math.random()*40)-20;
            newEnemy.className = 'enemy';
            newEnemy.dataset.damage=25;
            newEnemy.dataset.life=100;
            let size=Math.floor(Math.random()*40)+20
            newEnemy.dataset.size=size;
            newEnemy.width=size;
            MAIN.appendChild(newEnemy);
            break;
        case "dice":
            twitchClient.say(target, `Tu as fait un ${Math.floor(Math.random()*6)+1}`)
    }    
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${localStorage.getItem('twitchChannel')} as ${localStorage.getItem('botName')} via ${addr}:${port}`);
}