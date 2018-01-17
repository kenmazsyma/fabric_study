#!/bin/bash

# $1 : orderer1
# $2 : orderer1pw
# $3 : orderer
# $4 : org1.base

export FABRIC_CA_CLIENT_HOME=.
echo "#### $1 ####"
echo "* register *"
fabric-ca-client register -M admin -u http://localhost:7054 --id.name $1 --id.secret $2 --id.type client --id.affiliation $4 --id.attrs "hf.Registrar.Roles=client,hf.Registrar.Attributes=*,hf.Revoker=true,hf.GenCRL=true,hf.admin=true:ecert,abac.init=true:ecert"
echo "* enroll *"
fabric-ca-client enroll -M $1 -u http://$1:$2@localhost:7054
