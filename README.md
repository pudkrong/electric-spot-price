# Electric Spot Price Reporter

## Overview

This shell script is designed to fetch the electric spot price from the specified API endpoint (https://bff.malarenergi.se/spotpriser/api/v1/prices/area/SE3) and report the price through LINE Notify. In order to use LINE Notify for notifications, you will need to obtain an access token from your LINE account.

## Prerequisites

Before using this script, make sure you have the following prerequisites:

- **curl**: Ensure that curl is installed on your system. The script uses curl to make HTTP requests.
- **jq**: Ensure that jq is installed on your system. The script uses jq to extract desired data from json.

## Getting Started

1. **Obtain LINE Notify Access Token:**

   - Go to the [LINE Notify](https://notify-bot.line.me/en/) website and log in with your LINE account.
   - Create a new messaging channel, and obtain the access token.

2. **Configure the Script:**

   - Open the `spotprice.sh` script in a text editor.
   - Replace `<YOUR_LINE_ACCESS_TOKEN>` with the access token obtained from LINE Notify.

3. **Set Permissions:**
   - Ensure that the script has execute permissions. If not, run the following command:
     ```bash
     chmod +x spotprice.sh
     ```

## Usage

Run the script from the terminal as follows:

```bash
./spotprice.sh
```

This will fetch the electric spot price and send a notification to your LINE account.

## Schedule the Script

You can schedule the script to run at specific intervals using tools like cron. For example, to run the script every hour, add the following line to your crontab:

```bash
0 * * * * /path/to/spotprice.sh > /dev/null 2>&1
```

Adjust the path accordingly.

## Troubleshooting

If you encounter any issues, check the following:

- Ensure that curl and jq are installed and accessible in your environment.
- Verify that the LINE Notify access token is correctly configured in the script.

## Disclaimer

This script is provided as-is and is meant for educational purposes. Use it responsibly and ensure compliance with the terms of service of the API provider and LINE Notify.

## License

This project is licensed under the [MIT License](LICENSE).
