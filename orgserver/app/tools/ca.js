'use_strict';

let allconf = require('config');
let PeerAccessor = require('../blockchain/peeraccr2');
let log = require('../common/logger')('tools.ca');
let prnm = process.argv[2]||'mypeer';
let conf =  allconf.ChainEnv[prnm];

let $$ =  new PeerAccessor('mypher', conf);

$$.enroll(prnm, 'http://localhost:7054', 'ca.mypher.org').then(() => {
	$$.register('user3', '.').then(()=> {
		log.info('success');
		$$.revoke('user3').then(()=> {
			log.info('success to revoke');
		});
	}).catch(err => {
		log.error('failed to register user:' + err);
	});
	$$.term();
}).catch(err => {
	log.error('failed to enroll user:' + err);
	$$.term();
});

