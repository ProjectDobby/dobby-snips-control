const slotsParser = require("../../controllers/SlotParser");
const controller = require("../../controllers/MusicController");
const spotify = require("../../controllers/SpotifyController");

module.exports = new (require("../IntentBase"))(async ob => {
    let slots = slotsParser.getSlots(ob.slots);
    let song = (await controller.status.currentSong());
    console.log(song);
    let text = "";

    console.log(song);

    if (slots.get("track")) {
        text += "Der aktuelle Track heißt " + song.title;
    } else if (slots.get("album")) {
        text += "Das aktuelle Album heißt " + song.album;
    }

    if (slots.get("artist") && text !== "") {
        text += " und ist von " + (slots.get("track") ? song.artist : song.albumArtist);
    } else if (slots.get("artist")) {
        text += "Der aktuelle Song ist von " + song.artist;
    }
    console.log(text);
    return text;
});
