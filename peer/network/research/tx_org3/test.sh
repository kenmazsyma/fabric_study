# configtxlator start

ORG="Org3"
CONFIG_JSON="test.json"

#curl -X POST --data-binary @mypher_org3.block http://localhost:7059/protolator/decode/common.Block | jq .data.data[0].payload.data.config > ${CONFIG_JSON}
#jq '. * {"channel_group":{"groups":{"Application":{"groups":{"$Org3": .channel_group.groups.Application.groups.$Org3}}}}}' "${CONFIG_JSON}" | jq '.channel_group.groups.Application.groups.$Org3.values.MSP.value.config.name = "$Org3"' > ${CONFIG_JSON}
#jq ". * {\"channel_group\":{\"groups\":{\"Application\":{\"groups\":{\"$ORG\": .channel_group.groups.Application.groups.$ORG}}}}}" "${CONFIG_JSON}" > ${CONFIG_JSON}

#curl -X POST --data-binary @mypher_org3.block http://localhost:7059/protolator/decode/common.Block | jq .data.data[0].payload.data.config | jq .channel_group.groups.Application.groups.$ORG

curl -X POST --data-binary @mypher_org3.block http://localhost:7059/protolator/decode/common.Block | jq "{\"channel_group\":{\"groups\":{\"Application\":{\"groups\":{\"$ORG\": .data.data[0].payload.data.config.channel_group.groups.Application.groups.$ORG}}}}}" > ${CONFIG_JSON}

