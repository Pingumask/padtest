import { spawnEnemy } from "./game.js";

const twitchCredentials = {
    identity: {
      username: localStorage.getItem('botName'),
      password: localStorage.getItem('twitchOauth')
    },
    channels: [localStorage.getItem('twitchChannel')]
};

const twitchClient = new tmi.Client(twitchCredentials);

twitchClient.on('message', onMessageHandler);
twitchClient.on('connected', onConnectedHandler);

twitchClient.connect()
.catch(()=>{window.location.replace("./connect.html");})  

function onMessageHandler(channel, sender, msg, self) {
    console.log(`%c ${sender['display-name']} : ${msg}`,`color:${sender.color}`);
    if (self) { return; }     
    if (!msg.startsWith('!')) { return; } 
    const args = msg.split(" ");
    const command = args.shift().substring(1);
    switch(command){
        case "snow":
            document.querySelector('main').classList.toggle('snow');
            break;
        case "spawn":
            spawnEnemy(channel, sender, msg, self);            
            break;
        case "dice":
            twitchClient.say(channel, `Tu as fait un ${Math.floor(Math.random()*6)+1}`)
    }    
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${localStorage.getItem('twitchChannel')} as ${localStorage.getItem('botName')} via ${addr}:${port}`);
}