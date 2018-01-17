'use_strict';

let Client = require('fabric-client');
let path = require('path');
let fs = require('fs');
let os = require('os');
let cmn = require('../common/util');
let User = require('fabric-client/lib/User.js');
let FabricCAServices = require('fabric-ca-client/lib/FabricCAClientImpl');
let log = require('../common/logger')('blockchain.peeraccr2');

let store = {
	kv : {},
	setValue : function(k, v) {
		return new Promise(resolve => {
			this.kv[k] = v;
			log.info('KEY:' + k, ' VAL:' + v);
			resolve();
		});
	},
	getValue : function(k) {
		log.info('KEY:' + k);
		return this.kv[k];
	}
}



PeerAccessor2 = class {
	
	constructor(chid, conf) {
		this.client = null;
		this.member = null;
		this.channelID = chid;
		this.genesis_block = null;
		this.targets = null;
		this.eventhub = [];
		this.isConnect = false;
		this.conf = conf;
		this.admin = null;
	}
	
	async enroll(uid, caurl, caname) {
		this.client = new Client();
		this.member = new User(uid);
		this.client._userContext = null;
		this.member.setAffiliation('ccc');
		let cres = [];
		let d = this.conf;
		let keyPath = path.join(__dirname, d.admin.keystore);
		let keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
		let crtPath = path.join(__dirname, d.admin.signcerts);
		let crtPEM = readAllFiles(crtPath)[0];
		var cryptoSuite = Client.newCryptoSuite();
		cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore(
			{
				path: path.join(os.tmpdir(), 'hfc/'+d.mspid)
			}
		));
		this.client.setCryptoSuite(cryptoSuite);
		this.member.setCryptoSuite(cryptoSuite);
		this.client.setStateStore(store);
		let tlsOptions = {
			trustedRoots: [],
			verify: false
		};
		this.ca = await new FabricCAServices(caurl, tlsOptions, caname, cryptoSuite);
		this.admin = await this.ca.enroll({
			enrollmentID: 'admin',
			enrollmentSecret: 'adminpw'
		});
		if (!this.admin.key) {
			throw 'failed to get enrollment information';
		}
		await this.member.setEnrollment(this.admin.key, this.admin.certificate, d.mspid);
		if (this.member.isEnrolled()) {
			log.info('member is successfully enrolled.');
		} else {
			throw 'enrollement failed.';
		}
		await this.client.setUserContext(this.member);
		this.client.setCryptoSuite(cryptoSuite);
		let ctx = await this.client.getUserContext(uid, true);
		if (ctx && ctx.getName() == uid) {
			return;
		} else {
			throw 'failed to load user';
		}
	}

	async register(uid, affiliation) {
		let member = new User(uid);
		await member.setEnrollment(this.admin.key, this.admin.certificate, this.conf.mspid);
		let secret = await this.ca.register({enrollmentID: uid, affiliation: affiliation}, member);
	}

	async revoke(uid) {
		let member = new User(uid);
		await member.setEnrollment(this.admin.key, this.admin.certificate, this.conf.mspid);
		await this.ca.revoke({enrollmentID: uid}, member);
	}

	async term() {
		return new Promise(resolve => {
	//		setTimeout(()=>{
	//			resolve();
	//		}, 2000);
	//		this.eventhub.forEach(hub => {
	//			hub.disconnect();
	//		});
	//		this.client = null;
	//	//	this.channelID = null;
	//		this.channel = null;
	//		this.genesis_block = null;
	//		this.targets = null;
	//		this.eventhub = [];
	//		this.isConnect = false;
		});
	}
};

function readAllFiles(dir) {
	var files = fs.readdirSync(dir);
	var certs = [];
	files.forEach((file_name) => {
		let file_path = path.join(dir,file_name);
		let data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}
module.exports = PeerAccessor2;
