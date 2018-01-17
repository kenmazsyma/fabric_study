#!/bin/bash

export NODE_CONFIG_DIR=../config
node joinchannel_cc.js mypeer
node joinchannel_cc.js org2
node install_cc.js mypeer
node install_cc.js org2
node instantiate_cc.js mypeer
