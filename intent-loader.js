const fs = require("fs");

const musicIntents = new Map();

const init = () => {
};

const load = () => {
    const loadedIntents = [];
    for (let handler of fs.readdirSync("./intents/music")) {
        if (!handler.endsWith(".js")) return;
        handler = handler.replace(".js", "");
        try {
            musicIntents.set(handler, require("./intents/music/" + handler).init());
            console.log("Handler registered for intent: DieserMerlin:%s", handler);
            loadedIntents.push(handler);
        } catch (e) {
            console.log("Invalid handler: %s", handler);
            console.log(e);
        }
    }
    return loadedIntents;
};

const handle = async (intent, ob) => {
    intent = intent.split(":")[1];
    if (!musicIntents.has(intent)) return undefined;
    console.log("INTENT DETECTED: %s", intent);
    return await musicIntents.get(intent).handle(ob);
};

module.exports = {init, load, handle};
