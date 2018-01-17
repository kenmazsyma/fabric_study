#!/bin/bash

#configtxgen -channelID mypher -outputBlock mypher_org3.block -inspectBlock mypher_org3.block -profile MypherOrdererGenesis | sed -e '1d' > block.json

# neccessary to execute "configtxlator start"

ORG="Org3"
CONFIG_JSON="test.json"

curl -X POST --data-binary @mypher_org3.block http://localhost:7059/protolator/decode/common.Block | jq "{\"channel_group\":{\"groups\":{\"Application\":{\"groups\":{\"$ORG\": .data.data[0].payload.data.config.channel_group.groups.Application.groups.$ORG}}}}}" > ${CONFIG_JSON}
