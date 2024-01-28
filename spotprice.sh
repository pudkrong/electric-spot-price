#!/bin/bash

set -e

ACCESS_TOKEN=

# Use curl to fetch JSON data and jq to extract the required fields
curl_output=$(curl -s "https://bff.malarenergi.se/spotpriser/api/v1/prices/area/SE3")

# Check if curl or jq encountered an error
if [ -z "$curl_output" ]; then
    echo "Error: Unable to fetch or parse data."
    exit 1
fi

current_time=$(echo $curl_output | jq -r ".current.interval")
current_price=$(echo $curl_output | jq -r ".current.price")
today_min=$(echo $curl_output | jq -r ".todayMin.price")
today_max=$(echo $curl_output | jq -r ".todayMax.price")

message="Time ${current_time}: ${current_price}
Today min: ${today_min}
Today max: ${today_max}"

# Send notification to LINE notify
curl -XPOST https://notify-api.line.me/api/notify -H "Authorization: Bearer $ACCESS_TOKEN" -F "message=$message"
