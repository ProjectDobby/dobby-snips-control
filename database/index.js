const fs = require("fs");

if (!fs.existsSync("./files"))
    fs.mkdirSync("./files");

const has = (prop) => {
    return fs.existsSync("./files/" + prop)
};

const get = (prop) => {
    const val = fs.readFileSync("./files/" + prop);
    try {
        return JSON.parse(val.toString());
    } catch (e) {
        return val.toString();
    }
};

const del = (prop) => {
    fs.unlinkSync("./files/" + prop);
};

const set = (prop, val = null) => {
    if (has(prop)) del(prop);
    if (val == null) return;
    if (typeof val != "string") val = JSON.stringify(val);
    fs.writeFileSync("./files/" + prop, val);
};

const getOrSet = (prop, def) => {
    if (has(prop)) return get(prop);
    set(prop, def);
    return get(prop);
};

module.exports = {has, get, set, getOrSet};
