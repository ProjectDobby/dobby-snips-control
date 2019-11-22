const client = require('mqtt').connect('mqtt://localhost', {port: 1883});


const LEDS = require("child_process").spawn("/home/pi/env/bin/python", ["/home/pi/4mics_hat/pixels.py"]);

const ledQueue = [];

let ledSetter;
const led = (skipTimeout = false) => {
    if(!ledQueue.length) return;
    const mode = ledQueue[0];
    ledQueue.pop();
    if (ledSetter) clearTimeout(ledSetter);
    LEDS.stdin.write(mode + "\n");
    if (!skipTimeout) ledSetter = setTimeout(() => {
        led(mode, true);
    }, 1000);
    led();
};

const leds = (modes) => {
    if (typeof modes === "string") {
        ledQueue.push(modes)
    } else for (let mode of modes) {
        ledQueue.push(mode)
    }
    led();
};

const loader = require("./intent-loader");
loader.init();
const intents = loader.load();

const db = require("./database");
require("./api");

const spotify = require("./controllers/SpotifyController")();
spotify.then(async api => {
    const user = await api.getMe();
    console.log("User %s registered with spotify (%sPremium).", user.body.display_name, (user.body.product === 'premium' ? "" : "no "));
});

const controller = require("./controllers/MusicController");

let clients = [];
client.on('connect', async () => {
    leds(["alexa", "think", "wakeup", "off"]);

    const server = new (require("ws").Server)({port: 1884});
    console.log("WS Bridge running");
    server.on('connection', ws => {
        ws.on('message', msg => {
            try {
                msg = JSON.parse(msg);
                if (msg.type === "subscribe")
                    client.subscribe(msg.topic);
                if (msg.type === "publish")
                    client.publish(msg.topic, msg.msg);
            } catch (e) {
                ws.send(JSON.stringify({error: e}));
            }
        });
        clients.push(ws);
    });

    for (let intent of intents)
        await client.subscribe('hermes/intent/DieserMerlin:' + intent);

    await client.subscribe('hermes/hotword/#');
});

client.on('message', async (topic, message) => {
    // When receiving an MQTT message, trigger and action...
    // console.log("topic: %s, msg: %s", topic, message);
    const ob = JSON.parse(message);

    const validClients = [];
    clients.forEach(ws => {
        try {
            ws.send(JSON.stringify({topic, message: ob}));
            validClients.push(ws)
        } catch (e) {
        }
    });
    clients = validClients;

    switch (topic) {
        case 'hermes/hotword/toggleOff':
            onListen();
            return;

        case 'hermes/hotword/toggleOn':
            onUnlisten();
            return;
    }

    leds("think");
    const result = await loader.handle(topic, ob);
    if (result === undefined) return;
    client.publish("endSession", JSON.stringify({sessionId: ob.sessionId, text: result}))
    leds("speak");
});

let volume = db.getOrSet("volume", 50);
controller.playbackOptions.setVolume(volume).then(() => console.log("Initial Volume set to %i", volume));

const onListen = async () => {
    leds("wakeup");
    console.log("Listening");
    let v = 5;
    if (db.get("volume") < 5) v = 0;
    console.log("Lowered volume to %i", v);
    await controller.playbackOptions.setVolume(v);
};

const onUnlisten = async () => {
    leds(["speak", "off"]);
    console.log("Not listening anymore");
    volume = db.get("volume");
    console.log("Raised volume to %i", volume);
    await controller.playbackOptions.setVolume(volume);
};
