'use_strict';

let $$ = require('../blockchain/blockchain');
var log = require('../common/logger')('tools.joinchannel_cc');

$$.init().then(() => {
	console.log('#######');
	$$.joinChannel('peer1');
	return $$.joinChannel('peer2');
}).then(() => {
	log.info('successfully joined with channel.');
	$$.term();
}).catch((err) => {
	log.error('failed to join with channel:' + err);
	$$.term();
});
