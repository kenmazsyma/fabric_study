'use_strict';

let $$ = require('../blockchain/blockchain.js');
let log = require('../common/logger')('tools.instantiate_cc');

$$.init().then(() => {
	return $$.prepareChannel();
}).then(() => {
	log.info('successfully prepared channel.');
	return $$.upgrade('soila_chain', '1', ['init', 'a', '1']);
}).then((ret) => {
	log.info('successfully upgraded chaincode');
	$$.term();
}).catch((err) => {
	log.error('failed to upgrade chaincode:' + err);
	$$.term();
});
