const http = require("http");
const fs = require("fs");
const url = require('url');

const handlers = new Map();

const server = http.createServer((req, res) => {
    req.url = req.url.substr(1);
    const handler = handlers.get(req.url.replace(/\?.*$/, ""));
    req.params = url.parse(req.url, true).query;
    if (handler == null) {
        res.writeHead(404);
        res.write("The resource could not be found.");
    } else {
        try {
            let result = handler(req, res);
            if (result === "handled") return res.end();
            res.writeHead(200, {'Content-Type': 'application/json'});
            if (!result) result = {status: "OK"};
            const cache = [];
            res.write(JSON.stringify(result, function (key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        return;
                    }
                    cache.push(value);
                }
                return value;
            }), 2);
        } catch (e) {
            res.writeHead(400);
            res.write("An error occurred: " + e);
        }
    }
    res.end();
});

fs.readdirSync("./api/handlers/").forEach(file => {
    if (!file.toLowerCase().endsWith(".js")) return;
    try {
        const handler = require("./handlers/" + file.replace(".js", ""));
        handlers.set(handler.uri, handler.handler);
    } catch (e) {
        console.log("Invalid API handler found: %s", file.replace(".js", ""));
    }
});

server.listen(require("../config/api").port);
