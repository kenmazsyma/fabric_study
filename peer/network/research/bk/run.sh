#!/bin/bash
# usage : run.sh up/down
docker-compose -f docker-compose_$1.yaml $2

