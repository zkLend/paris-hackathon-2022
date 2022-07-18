#!/bin/sh

set -e

mkdir -p ./build/

cd ./src/

starknet-compile ./Account.cairo --account_contract --output ../build/Account.json
