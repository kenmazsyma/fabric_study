'use_strict';

let $$ = require('../blockchain/blockchain.js');
let log = require('../common/logger')('tools.install_cc');

let ver = process.argv[process.argv.length-1];

$$.init().then(() => {
	return $$.prepareChannel();
}).then(() => {
	return $$.install('mypher_chain', 'github.com/mypher/peer/chaincode', ver);
}).then((ret) => {
	log.info('successfully installed chaincode');
	$$.term();
}).catch((err) => {
	log.error('failed to install chaincode:' + err);
	$$.term();
});

