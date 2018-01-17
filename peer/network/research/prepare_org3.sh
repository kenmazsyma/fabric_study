#!/bin/bash

# generate keys

echo "generate keys?(y/N)"
read inp

function mkCryptoSet() {
	mkdir keys/$1
	cd keys/$1
	mkdir admincerts
	mkdir cacerts
	mkdir keystore
	mkdir signcerts
	cd ../..
	cp ca_client/$2/signcerts/cert.pem keys/$1/admincerts/cert.pem
	cp ca_client/$1/cacerts/localhost-7054.pem keys/$1/cacerts/ca.mypher.org-cert.pem
	cp ca_client/$1/keystore/* keys/$1/keystore/
	cp ca_client/$1/signcerts/cert.pem keys/$1/signcerts/$3.mypher.org-cert.pem
}

function mkOrgSet() {
	cd ca_client
	./reg.sh $2 $3 orderer $1
	./reg_admin.sh $4 $5 peer $1
	./reg.sh $6 $7 peer $1
	cd ..
	mkCryptoSet $2 $4 $1
	mkCryptoSet $4 $4 $1
	mkCryptoSet $6 $4 $1
}

if [ $inp = 'y' ]; then
	cd keys
	#rm -Rf crypto-config
	#cryptogen generate --config crypto-config.yaml
	cd ..
	docker-compose -f docker-compose_ca.yaml up &
	sleep 5s
	#cd ca_client
	#./enroll_admin.sh
	#cd ..
	mkOrgSet org3 orderer3 orderer3pw admin3 admin3pw peer3 peer3pw
	docker-compose -f docker-compose_ca.yaml down
fi

echo "generate genesis block?(y/N)"
read inp
if [ $inp = 'y' ]; then
	cd tx_org3
	configtxgen -profile MypherOrdererGenesis -channelID mypher -outputBlock mypher_org3.block 
	configtxgen -profile MypherChannel -channelID mypher -outputCreateChannelTx mypher_org3.tx
	configtxgen -channelID mypher -outputBlock mypher_org3.block -inspectBlock mypher_org3.block -profile MypherOrdererGenesis > block.json
	configtxgen -channelID mypher -outputCreateChannelTx mypher_org3.tx -inspectChannelCreateTx mypher_org3.tx -profile MypherChannel > tx.json
	cd ..
fi

#docker-compose -f docker-compose.yaml up &
#sleep 10s
#echo "join org1 to channel mypher..."
#export CORE_PEER_LOCALMSPID=Org1MSP
#export CORE_PEER_MSPCONFIGPATH=$(pwd)/keys/admin1
#echo $CORE_PEER_MSPCONFIGPATH
#peer channel join -b $(pwd)/tx/mypher.tx
#echo "join org2 to channel mypher..."
#export CORE_PEER_LOCALMSPID=Org2MSP
#export CORE_PEER_MSPCONFIGPATH=$(pwd)/keys/admin2
#peer channel join -b tx/mypher.tx
#docker-compose -d docker-compose.yaml down
#
