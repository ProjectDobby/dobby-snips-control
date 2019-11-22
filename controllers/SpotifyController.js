const SpotifyApi = require("spotify-web-api-node");
const config = require("../config/spotify-api");
const db = require("../database");
const request = require("request");

const spotify = new SpotifyApi(config);

if (db.get("expires") < Date.now()) {
    module.exports = () => {
        return new Promise(resolve => {
            const form = {
                client_id: config.clientId,
                client_secret: config.clientSecret,
                redirect_uri: config.redirectUri,
                refresh_token: db.get("refreshToken"),
                grant_type: "refresh_token"
            };
            request.post({
                url: "https://accounts.spotify.com/api/token",
                form
            }, (err, res, body) => {
                body = JSON.parse(body);
                db.set("accessToken", body.access_token);
                db.set("scope", body.scope);
                db.set("expires", (body.expires_in - 100) * 1000 + Date.now());
                spotify.setAccessToken(body.access_token);
                resolve(spotify);
                console.log("REFRESHED ACCESS TOKEN");
            });
        })
    };
} else {
    spotify.setAccessToken(db.get("accessToken"));
    module.exports = async () => spotify;
}
