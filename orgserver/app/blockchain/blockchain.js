'use_strict';

//let allconf = require('config');
let PeerAccessor = require('./peeraccr');
//let conf = {
//	orderer : allconf.ChainEnv.orderer,
//	org : [ allconf.ChainEnv[process.argv[2]||'mypeer']]
//};

module.exports =  new PeerAccessor(process.argv[2]||'mypeer');
