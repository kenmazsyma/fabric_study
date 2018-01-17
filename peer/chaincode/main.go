/*
Package main provides chaincode for mypher_chain.
*/
package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/mypher/peer/chaincode/core"
	"github.com/mypher/peer/chaincode/ledger/peer"
	"github.com/mypher/peer/chaincode/ledger/person"
	"github.com/mypher/peer/chaincode/log"
)

var invoke_list = map[string]core.InvokeRoutineType{
	"person.register":          person.Register,
	"person.update":            person.Update,
	"person.get":               person.Get,
	"person.add_activity":      person.AddActivity,
	"person.add_reputation":    person.AddReputation,
	"person.remove_reputation": person.RemoveReputation,
	"peer.register":            peer.Register,
	"peer.update":              peer.Update,
	"peer.get":                 peer.Get,
	"peer.deregister":          peer.Deregister,
}

// ================================================
// main
// ================================================

// main is a function for executing chaincode for mypher_chain
func main() {
	log.Init("mypher_chain", log.LEVEL_DEBUG)
	cc := new(core.CC)
	cc.SetInvokeMap(invoke_list)
	err := shim.Start(cc)
	if err != nil {
		log.Error("errored in starting chaincode: " + err.Error())
	}
}
