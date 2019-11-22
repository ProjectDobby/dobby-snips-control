const MPC = require('mpc-js').MPC;
const remote = new MPC();

remote.connectTCP('localhost', 6600).then();

module.exports = remote;
