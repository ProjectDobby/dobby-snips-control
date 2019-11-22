const slotsParser = require("../../controllers/SlotParser");
const controller = require("../../controllers/MusicController");

module.exports = new (require("../IntentBase"))(async (ob) => {
    // console.log(ob);
    const spotify = await require("../../controllers/SpotifyController")();

    slotsParser.init(ob.slots);
    let artist, track, provider, scope, genre;
    console.log("ARTIST: %s", artist = slotsParser.getSlot("artist"));
    console.log("TRACK: %s", track = slotsParser.getSlot("track"));
    console.log("PROVIDER: %s", provider = slotsParser.getSlot("provider"));
    console.log("SCOPE: %s", scope = slotsParser.getSlot("scope"));
    console.log("GENRE: %s", genre = slotsParser.getSlot("genre"));

    let text;

    const uris = [];
    if (track) {
        text = "Hier ist " + track + (artist ? " von " + artist : "");
        let getTracks = async (artist) => (await spotify.searchTracks(track + ((artist ? " " + artist : "")), {limit: 1})).body.tracks.items;
        if (scope === "Album") {
            text = "Hier ist das Album " + track +  + (artist ? " von " + artist : "");
            getTracks = async (artist) => (await spotify.searchAlbums(track + ((artist ? " " + artist : "")), {limit: 1})).body.albums.items;
        }
        let tracks;
        try {
            tracks = await getTracks(artist);
        } catch (e) {
            console.log(e);
            try {
                if (artist) tracks = await getTracks();
                if (!tracks || !tracks.length) throw(123);
            } catch (e) {
                console.log(e);
                return "Ich konnte den Song leider nicht finden.";
            }
        }
        tracks.forEach(track => uris.push(track.uri));
    } else if (artist) {
        text = "Hier sind die Top 10 Tracks von " + artist;
        console.log("PLAY-ARTIST: %s. Searching on Spotify...", artist);

        let _artist;
        try {
            const getArtist = async () => (await spotify.searchArtists(artist, {limit: 1})).body.artists.items[0];
            _artist = await getArtist(artist);
            if (!_artist) throw(123);
        } catch (e) {
            return "Ich konnte den Künstler " + artist + " leider nicht finden.";
        }

        if (_artist)
            console.log("Artist found with id %s. Playing top songs...", _artist.id);

        const topSongs = async () => (await spotify.getArtistTopTracks(_artist.id, "DE")).body.tracks;
        (await topSongs()).forEach(song => uris.push(song.uri));
    }

    if (uris.length) {
        console.log("Clearing old playlist...");
        await controller.currentPlaylist.clear();
        await controller.playback.stop();
    }

    for (let uri of uris)
        await controller.currentPlaylist.add(uri);

    await controller.playback.play();
    return text;
});

