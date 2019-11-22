const slotsParser = require("../../controllers/SlotParser");
const controller = require("../../controllers/MusicController");

module.exports = new (require("../IntentBase"))(async ob => {
    slotsParser.init(ob.slots);
    let amount = 1;
    const amountSlot = slotsParser.getSlot("amount");
    if (amountSlot) amount = parseInt(amountSlot);

    console.log("Skipping %i songs...", amount);

    for (let i = 0; i < amount; i++) {
        try {
            await controller.playback.next();
        } catch (e) {
        }
    }
});
