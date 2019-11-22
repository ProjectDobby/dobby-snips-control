const config = require("../../config/spotify-api");

const uri = "spotify";

const handler = (req, res) => {
    const Location = "https://accounts.spotify.com/authorize"
        + "?client_id=" + config.clientId
        + "&redirect_uri=" + config.redirectUri
        + "&scope=user-read-private%20user-read-email%20user-read-playback-state"
        + "&response_type=code";
    res.writeHead(303, {Location});
    return "handled";
};

module.exports = {handler, uri};
