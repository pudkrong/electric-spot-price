#!/bin/bash

if [[ -e ~/spotprice/.env ]]; then
	export $(cat ~/spotprice/.env | xargs)
fi

# Run the Node.js script
node ~/spotprice/spotprice.js