const slotsParser = require("../../controllers/SlotParser");
const controller = require("../../controllers/MusicController");
const db = require("../../database");

module.exports = new (require("../IntentBase"))(async ob => {
    const slots = slotsParser.getSlots(ob.slots);

    let volume = db.get("volume");

    const percent = slots.get("percent");
    const amount = slots.get("number");

    let num = percent != null ? percent : amount;
    if (num == null) num = 0;

    if (["louder", "quieter"].includes(slots.change_direction)) {
        if (num === 0) {
            if (slots.change_direction === "louder") volume += 10;
            else volume -= 10;
        } else {
            if (slots.change_direction === "louder") volume += num;
            else volume -= num;
        }
    } else {
        if (slots.change_direction === "full") volume = 100;
        else volume = num;
    }

    let width = process.stdout.columns;
    let text = "NEW VOLUME: " + volume + "% [X]";
    width -= (text.length - 1);
    let x = "";
    for (let i = 0; i < width; i++) {
        if ((i / width) < (volume / 100)) x += "=";
        else x += " ";
    }

    console.log(text.replace("X", x));

    db.set("volume", volume);
    return "Die Lautstärke beträgt nun " + volume;
});
