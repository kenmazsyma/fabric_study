'use_strict';

let $$ = require('../blockchain/blockchain.js');
let log = require('../common/logger')('tools.instantiate_cc');

let ver = process.argv[process.argv.length-1];
$$.init().then(() => {
	return $$.prepareChannel();
}).then(() => {
	log.info('successfully prepared channel.');
	return $$.instantiate('mypher_chain', ver, ['init', 'a', '1']);
}).then((ret) => {
	log.info('successfully instantiated chaincode');
	$$.term();
}).catch((err) => {
	log.error('failed to instantiate chaincode:' + err);
	$$.term();
});

