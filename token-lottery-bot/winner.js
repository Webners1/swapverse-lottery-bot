const TelegramBot = require('node-telegram-bot-api');

const token = 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with your bot token
const bot = new TelegramBot(token, { polling: true });

const chatId = 'YOUR_TELEGRAM_CHAT_ID'; // Replace with your chat ID

function sendWinnersMessage(lotteryId, winners) {
  const message = `
🎉 *${lotteryId} Winners* 🎉

Congratulations to the following winners:
1. ${winners[0]}
2. ${winners[1]}
3. ${winners[2]}

Enjoy your prizes! 🏆
  `;

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}
export default sendWinnersMessage
