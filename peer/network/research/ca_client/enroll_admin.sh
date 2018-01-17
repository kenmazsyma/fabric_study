#!/bin/bash

export FABRIC_CA_CLIENT_HOME=.
echo "* enroll admin of root ca *"
fabric-ca-client enroll -M admin -u http://admin:adminpw@localhost:7054
