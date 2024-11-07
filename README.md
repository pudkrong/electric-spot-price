# Electric Spot Price Reporter

## Overview

This application is designed to fetch the electric spot price from a specified API endpoint: [https://www.elprisetjustnu.se/elpris-api](https://www.elprisetjustnu.se/elpris-api). The price information is then reported via the Telegram Bot API. Instructions on how to use the Telegram Bot API can be found [here](https://dev.to/climentea/push-notifications-from-server-with-telegram-bot-api-32b3).

## Usage

1. Copy the `.env.example` file to a new file named `.env` and fill in the required values.
2. Run the following command to start the application:

   ```bash
   node spotprice.js
   ```

   This command will fetch the electric spot price and send a notification through the Telegram bot.

## License

This project is licensed under the [MIT License](LICENSE).