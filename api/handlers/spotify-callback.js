const db = require("../../database");
const config = require("../../config/spotify-api");
const request = require("request");

const uri = "spotify-callback";

const handler = (req) => {
    const form = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        code: req.params.code,
        grant_type: "authorization_code"
    };
    request.post({
        url: "https://accounts.spotify.com/api/token",
        form
    }, (err, res, body) => {
        body = JSON.parse(body);
        db.set("accessToken", body.access_token);
        db.set("refreshToken", body.refresh_token);
        db.set("scope", body.scope);
        db.set("expires", (body.expires_in - 100) * 1000 + Date.now());
    });
    return req.params.code;
};

module.exports = {handler, uri};
