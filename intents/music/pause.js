const slotsParser = require("../../controllers/SlotParser");
const controller = require("../../controllers/MusicController");

module.exports = new (require("../IntentBase"))(async ob => {
    slotsParser.init(ob.slots);
    console.log(slotsParser.getSlots());
    await controller.playback.pause(true);
});
