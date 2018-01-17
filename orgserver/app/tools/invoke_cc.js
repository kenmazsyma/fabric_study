'use_strict';

let $$ = require('../blockchain/blockchain');
let log = require('../common/logger')('tools.invoke_cc');

$$.init().then(() => {
	return $$.prepareChannel();
}).then((ret) => {
	log.info('channel is successfully prepared.');
	return $$.invoke('mypher_chain', 'person.put', ['123', 'testdata']);
}).then((ret) => {
	log.info('invoking person.put is successfully called.' + JSON.stringify(ret));
	$$.term();
}).catch((err) => {
	log.error('failed to invoke person.put:' + err);
	$$.term();
});
