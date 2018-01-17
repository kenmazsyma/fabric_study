'use_strict';

let allconf = require('config');
let PeerAccessor = require('./peeraccr2');
let prnm = process.argv[2]||'mypeer';
let conf =  allconf.ChainEnv[prnm];

module.exports =  new PeerAccessor('mypher', conf);
