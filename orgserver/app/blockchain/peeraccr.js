'use_strict';

let conf = require('config').ChainEnv;
let Client = require('fabric-client');
let path = require('path');
let util = require('util');
let fs = require('fs');
let os = require('os');
let cmn = require('../common/util');
let User = require('fabric-client/lib/User.js');
let log = require('../common/logger')('blockchain.peeraccr');
let FabricCAServices = require('fabric-ca-client/lib/FabricCAClientImpl');

function convertPayload(data) {
	let enc = cmn.str.b642s(data);
	return JSON.parse(enc);
}

PeerAccessor = class {

	constructor() {
		this.client = null;
		this.channel = null;
		this.genesis_block = null;
		this.peers = null;
		this.eventhub = [];
		this.isConnect = false;
		this.orderer = null;
	}

	async init() {
		let loadPEM = function(p) {
			let keyPath = path.join(__dirname, p);
			return Buffer.from(readAllFiles(keyPath)[0]).toString();
		};
		//await this._join2CA();
		this.client = new Client();
		this.channel = this.client.newChannel(conf.common.chid);
		this.orderer = this.client.newOrderer(conf.orderer.url);
		this.channel.addOrderer(this.orderer);
		await this._useUser(conf.orderer.mspid, conf.orderer.user);
		this.genesis_block = await this.channel.getGenesisBlock({
			txId: this.client.newTransactionID(),
			oreder: this.orderer
		});
		this._releaseUser();
		
		this.users = []
		this.peers = [];
		this.eventhub = [];
		for ( var i in conf.peers ) {
			let d = conf.peers[i];
			this.users.push(await this._useUser(d.mspid, d.user));
			//this.users.push(await this._useAdminUser(d));
			let pem = loadPEM(d.cert);
			let opts = { pem : loadPEM(d.cert), 'ssl-target-name-override' : d.host };
			this.peers.push(this.client.newPeer(d.rpc, opts));
			let hub = this.client.newEventHub();
			this.eventhub.push(hub);
			hub.setPeerAddr(d.evtrpc, opts);
			hub.connect();
			this._releaseUser();
		};
	}

	async joinChannel(name) {
		let peer = null;
		let idx = -1
		conf.peers.some((d, i) => {
			if (d.user.name === name) {
				peer = d;
				idx = i;
				return true;
			}
		});
		if (peer===null) {
			throw 'peer ' + name + ' not found';
		}
		//this.client.setUserContext(this.users[idx]);
		let creator = await this._useAdminUser(peer);
		let request = {
			targets : [this.peers[idx]],
			block : this.genesis_block,
			txId : this.client.newTransactionID(true)
		};
		let txPromise = [];
		/*this.eventhub.forEach(hub => {
			txPromise.push(new Promise((reso, reje) => {
				let handle = setTimeout(reje, 30000);
				hub.registerBlockEvent(block => {
					clearTimeout(handle);
					if(block.data.data.length === 1) {
						let ch_header = block.data.data[0].payload.header.channel_header;
						if (ch_header.channel_id === conf.common.chid) {
							log.info('The new channel has been successfully joined on peer '+ hub.getPeerAddr());
							reso();
						}
						else {
							log.error('The new channel has not been succesfully joined');
						}
					} else {
						log.error('Response of registerBlockEvent is not correct.');
					}
					reje();
				});
			}));
		});*/
		let sendPromise = this.channel.joinChannel(request);
		txPromise.push(sendPromise);
		await Promise.all(txPromise);
		this.isConnect = true;
	}
	
	async prepareChannel() {
		try {
			await this.channel.initialize();
			log.info('channel is successfully initiated:');
			this.isConnect = true;
		} catch (e) {
			log.error('FabricClientBase.prepareChannel:');
			throw e;
		}
	}

	async invoke(ccid, funcname, args) {
		log.info('data:' + funcname);
		let request = {
			chaincodeId : ccid,
			targets : this.peers,
			fcn: funcname,
			args: args,
			chainId : conf.common.chid,
			txId: this.client.newTransactionID()
		};
		try {
			let results = await this.channel.sendTransactionProposal(request);
			let rslt0 = results[0][0].response;
	//		if (rslt0.status&&rslt0.status===200) {
				await this.sendTransaction(request.txId, results);
	//		}
			return {
				status : rslt0.status,
				message : rslt0.message,
				data : convertPayload(rslt0.payload)
			};
		} catch (e) {
			log.error(e);
			return {
				status : 500,
				message : 'failed to convert payload data received from legder.'
			};
		}
	}

	async install(ccid, path, ver) {
		let request = {
			targets: this.peers,
			chaincodePath: path,
			chaincodeId: ccid,
			chaincodeVersion: ver
		};
		return this.client.installChaincode(request);
	}

	async instantiate(ccid, ver, args) {
		let request = {
			txId : this.client.newTransactionID(),
			chaincodeId : ccid,
			chaincodeVersion: ver,
			targets: this.peers,
			args: args
		};
		let results = await this.channel.sendInstantiateProposal(request);
		return this.sendTransaction(request.txId, results);
	}

	async upgrade(ccid, ver, args) {
		let request = {
			txId : this.client.newTransactionID(),
			chaincodeId : ccid,
			chaincodeVersion: ver,
			targets: this.peers,
			args: args
		};
		let results = await this.channel.sendUpgradeProposal(request);
		return this.sendTransaction(request.txId, results);
	}

	async term() {
		return new Promise(resolve => {
			setTimeout(()=>{
				resolve();
			}, 2000);
			this.eventhub.forEach(hub => {
				hub.disconnect();
			});
			this.client = null;
			this.channel = null;
			this.genesis_block = null;
			this.peers = null;
			this.eventhub = [];
			this.isConnect = false;
		});
	}

	async sendTransaction(txid, results) {
		var proposalResponses = results[0];
		var proposal = results[1];
		var all_good = true;
		for (var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[i].response &&
				proposalResponses[i].response.status === 200) {
				one_good = true;
				log.info('proposal was good');
			} else {
				log.error('proposal was bad');
			}
			all_good = all_good & one_good;
		}
		if (all_good) {
			let txPromise = [];
			this.eventhub.forEach(hub => {
				hub.connect();
				txPromise.push(new Promise((resolve, reject) => {
					let handle = setTimeout(() => {
						hub.disconnect();
						reject();
					}, 30000);
					let deployId = txid.getTransactionID();
					hub.registerTxEvent(deployId, (tx, code) => {
						clearTimeout(handle);
						hub.unregisterTxEvent(deployId);
						hub.disconnect();
						if (code !== 'VALID') {
							log.error('transaction(' + tx + ') was invalid, code = ' + code);
							reject();
						} else {
							log.info('transaction(' + tx + ') was valid.');
							resolve();
						}
					}, (err) => {
						console.log(err);
					});
				}));
			});
			let req = {
				proposalResponses: results[0],
				proposal: results[1]
			};
			let sendPromise = this.channel.sendTransaction(req);
			return Promise.all([sendPromise].concat(txPromise));
		}
		throw 'failed to send proposal or receive valid response. response null or status is not 200. exiting...'
	}

	watchBlockEvent() {
		let txPromise = [];
		this.eventhub.forEach(hub => {
			txPromise.push(new Promise((reso, reje) => {
				let handle = setTimeout(reje, 30000);
				hub.registerBlockEvent((block) => {
					clearTimeout(handle);
					if(block.data.data.length === 1) {
						let ch_header = block.data.data[0].payload.header.channel_header;
						if (ch_header.channel_id === conf.common.chid) {
							log.info('The new channel has been successfully joined on peer '+ hub.getPeerAddr());
							reso();
						}
						else {
							log.error('The new channel has not been succesfully joined');
						}
					} else {
						log.error('Response of registerBlockEvent is not correct.');
					}
					reje();
				});
			}));
		});
	}

	async _join2CA() {
		let suite = Client.newCryptoSuite();
		suite.setCryptoKeyStore(Client.newCryptoKeyStore({
			path: path.join(os.tmpdir(), conf.common.chid + '/crypto/' + conf.ca.name)
		}));
		let tlsOptions = {
			trustedRoots: [],
			verify: false
		};
		this.ca = await new FabricCAServices(conf.ca.url, tlsOptions, conf.ca.name, suite);
	}

/*	async _prepareUser(info) {
		let suite = Client.newCryptoSuite();
		suite.setCryptoKeyStore(Client.newCryptoKeyStore({
			path: path.join(os.tmpdir(), conf.common.chid + '/crypto/'+ info.user.name)
		}));
		let ocert = await this.ca.enroll({
			enrollmentID: info.user.name,
			enrollmentSecret: info.user.secret
		});
		if (!ocert.key) {
			throw 'failed to get enrollment information for ' + info.user.name;
		}
		let user = new User(info.user.name);
		await user.setEnrollment(ocert.key, ocert.certificate, info.mspid);
		if (user.isEnrolled()) {
			log.info(info.user.name + ' is successfully enrolled.');
		} else {
			throw 'enrollement for' + info.user.name + ' failed.';
		}
		let store = await Client.newDefaultKeyValueStore({
			path: path.join(os.tmpdir(), conf.common.chid + '/' + info.user.name)
		});
		this.client.setStateStore(store);
		user.setAffiliation(info.user.affiliation);
		await this.client.setUserContext(user);
		user.setCryptoSuite(suite);
		this.client.setCryptoSuite(suite);
		let ctx = await this.client.getUserContext(info.user.name, true);
		if (!ctx || ctx.getName() !== info.user.name) {
			throw 'failed to load ' + info.user.name;
		}
		return user;
	}*/

	async _useUser(mspid, info) {
		let store = await Client.newDefaultKeyValueStore({
			path: path.join(os.tmpdir(), conf.common.chid + '/' + info.name)
		});
		this.client.setStateStore(store);
		let keyPath = path.join(__dirname, info.msppath, 'keystore');
		let keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
		let crtPath = path.join(__dirname, info.msppath, 'signcerts');
		let crtPEM = readAllFiles(crtPath)[0];
		return await this.client.createUser({
			username: info.name,
			mspid : mspid,
			cryptoContent: {
				privateKeyPEM: keyPEM.toString(),
				signedCertPEM: crtPEM.toString()
			}
		});
	}

	async _useAdminUser(info) {
		let store = await Client.newDefaultKeyValueStore({
			path: path.join(os.tmpdir(), conf.common.chid,  info.user.name)
		});
		this.client.setStateStore(store);
		let cryptoSuite = Client.newCryptoSuite();
		cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({
			path: path.join(os.tmpdir(), conf.common.chid, 'c', info.user.name)
		}));
		this.client.setCryptoSuite(cryptoSuite);
		let keyPath = path.join(__dirname, info.user.msppath, 'keystore');
		let keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
		let crtPath = path.join(__dirname, info.user.msppath, 'signcerts');
		let crtPEM = readAllFiles(crtPath)[0];
		let keyPathAdm = path.join(__dirname, info.admin.msppath, 'keystore');
		let keyPEMAdm = Buffer.from(readAllFiles(keyPathAdm)[0]).toString();
		let crtPathAdm = path.join(__dirname, info.admin.msppath, 'signcerts');
		let crtPEMAdm = readAllFiles(crtPathAdm)[0];
		let user = await this.client.createUser({
			username: info.user.name,
			mspid : info.mspid,
			cryptoContent: {
				privateKeyPEM: keyPEM.toString(),
				signedCertPEM: crtPEM.toString()
			}
		});
		this.client.setAdminSigningIdentity(keyPEMAdm.toString(), crtPEMAdm.toString(), info.mspid);
		return user;
	}

	_releaseUser() {
		this.client._userContext = null;
	}

	_chkBlkEvent(cb) {
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

module.exports = PeerAccessor;
