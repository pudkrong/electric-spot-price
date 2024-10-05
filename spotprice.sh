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

unit=$(echo $curl_output | jq -r ".unit")
current_date=$(echo $curl_output | jq -r ".current.startDateTime")
current_time=$(echo $curl_output | jq -r ".current.interval")
current_price=$(echo $curl_output | jq -r ".current.price | tonumber | (.*1000 | round) / 1000")
today_min=$(echo $curl_output | jq -r ".todayMin.price | tonumber | (.*1000 | round) / 1000")
today_max=$(echo $curl_output | jq -r ".todayMax.price | tonumber | (.*1000 | round) / 1000")

normalized_date=$(echo "$current_date" | sed 's/T.*$//')

message="Date ${normalized_date} > ${current_time}:

Current: ${current_price} ${unit}
Today min: ${today_min} ${unit}
Today max: ${today_max} ${unit}"

echo $message
# Send notification to LINE notify
curl -XPOST https://notify-api.line.me/api/notify -H "Authorization: Bearer $ACCESS_TOKEN" -F "message=$message"
