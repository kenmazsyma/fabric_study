#!/bin/bash

# neccessary to genarate genesis block for being added org before executing

ORG="Org3"
BLOCK_PATH="tx_org3/mypher_org3.block"
PROTOLATOR_API="http://localhost:7059/protolator"
CONFIGTXLATOR_API="http://localhost:7059/configtxlator"
OUTPATH="addtest"
CONFIG_JSON="${OUTPATH}/config.json"
CONFIG_PB="${OUTPATH}/config.pb"
FOR_APPEND_JSON="${OUTPATH}/config_for_append.json"
FOR_APPEND_PB="${OUTPATH}/config_for_append.pb"
AFTER_APPEND_JSON="${OUTPATH}/config_after_append.json"
AFTER_APPEND_PB="${OUTPATH}/config_after_append.pb"
CONFIG_UPDATE_PB="${OUTPATH}/config_update.pb"
CONFIG_UPDATE_ENVELOPE_JSON="${OUTPATH}/config_update_as_envelope.json"
CONFIG_UPDATE_ENVELOPE_PB="${OUTPATH}/config_update_as_envelope.pb"
CONFIG_NEW_PB="${OUTPATH}/config_block_new.pb"
CONFIG_NEW_JSON="${OUTPATH}/config_block_new.json"

CHANNEL="mypher"

#export CORE_PEER_LOCALMSPID=Org1MSP
#export CORE_PEER_MSPCONFIGPATH=$(pwd)/keys/peer1
#export CORE_PEER_MSPCONFIGPATH=$(pwd)/keys/admin1
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=$(pwd)/keys/peer3

ORDERER_URL="localhost:7050"
ORDERER_CA_FILE="./keys/peer1/signcerts/org1.mypher.org-cert.pem"

rm -R ${OUTPATH}
mkdir ${OUTPATH}

# fetch configuration block
echo "FETCHING..."
peer channel fetch config addtest/config_block.pb -o ${ORDERER_URL} -c ${CHANNEL} --cafile ${ORDERER_CA_FILE}
echo "COMPLETED..."

# convert the file into human-readable file
curl -X POST --data-binary @addtest/config_block.pb ${PROTOLATOR_API}/decode/common.Block  > addtest/config_block.json
