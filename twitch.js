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
    if (self) { return; } 
    console.log(context)
    console.log(msg)
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${localStorage.getItem('twitchChannel')} as ${localStorage.getItem('botName')} via ${addr}:${port}`);
}