#!/bin/bash

# generate keys

echo "generate keys?(y/N)"
read inp

if [ $inp = 'y' ]; then
	cd keys
	rm -Rf crypto-config
	cryptogen generate --config crypto-config.yaml
	cd ..
fi

echo "generate genesis block?(y/N)"
read inp
if [ $inp = 'y' ]; then
	cd tx
	rm mypher.*
	configtxgen -profile MypherOrdererGenesis -channelID mypher -outputBlock mypher.block 
	configtxgen -profile MypherChannel -channelID mypher -outputCreateChannelTx mypher.tx
	configtxgen -channelID mypher -outputBlock mypher.block -inspectBlock mypher.block -profile MypherOrdererGenesis
	configtxgen -channelID mypher -outputCreateChannelTx mypher.tx -inspectChannelCreateTx mypher.tx -profile MypherChannel
	cd ..
fi


cd keys

