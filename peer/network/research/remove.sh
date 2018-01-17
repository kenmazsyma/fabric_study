cd ca_home
rm ca-cert.pem
rm fabric-ca-server.db
rm -R msp
cd ../ca_client
rm -R admin*
rm -R orderer*
rm -R peer*
cd ../keys
rm -R admin*
rm -R orderer*
rm -R peer*
cd ../tx
rm -R mypher*
cd ..
