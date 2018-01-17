#!/bin/bash

fabric-ca-server init -b admin:adminpw
fabric-ca-server start -b admin:adminpw
