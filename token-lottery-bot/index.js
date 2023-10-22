const TelegramBot = require('node-telegram-bot-api');
const Web3 = require('web3');
const axios = require('axios');

// Telegram Bot Token
const TELEGRAM_TOKEN = '6410417020:AAEqzwujcTj69QxfG1tiEdXAzJgr9TnuxaI';

// Ethereum Node URL
const ETHEREUM_NODE_URL = 'https://bsc-testnet.public.blastapi.io';

// Lottery Contract Address
const LOTTERY_CONTRACT_ADDRESS = '0x7a491dA575A00b14A88DC4B9914E0c2323A1eFd3';

// Main Telegram Channel
const MAIN_CHANNEL_USERNAME = 'swapverseresesre';

// Creating an instance of the Telegram Bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Creating an instance of the Ethereum Web3 provider


// Function to verify if the user transferred tokens to the lottery contract
function verifyTransaction(txHash, contractAddress=LOTTERY_CONTRACT_ADDRESS) {
    // Get the transaction details
    const web3 = new Web3(ETHEREUM_NODE_URL);
    return web3.eth.getTransaction(txHash)
      .then((transaction) => {
        if (!transaction) {
          return false; // Transaction not found
        }
  
        // Check if the transaction is within the last 800 blocks
        const currentBlockNumber = web3.eth.getBlockNumber();
        if (currentBlockNumber - transaction.blockNumber > 800) {
          return false; // Transaction is not within the last 800 blocks
        }
  
        // Check if the transaction input data is a transfer to the contract address
        const inputData = transaction.input;
        const transferMethodSignature = '0xa9059cbb'; // Transfer method signature for ERC20 tokens
        if (inputData.slice(0, 10) !== transferMethodSignature) {
          return false; // Transaction does not involve a token transfer
        }
  
        // Extract the token contract address and recipient address from the transaction input data
        const tokenAddress = '0x' + inputData.slice(34, 74); // Assuming the token address is at a fixed position in the input data
        const recipientAddress = '0x' + inputData.slice(74, 114); // Assuming the recipient address is at a fixed position in the input data
  
        // Create an instance of the ERC20 token contract
        const tokenContract = new web3.eth.Contract(contractABI, tokenAddress);
  
        // Check if the recipient address is the contract address
        return tokenContract.methods.balanceOf(recipientAddress).call()
          .then((balance) => {
            return balance > 0 && recipientAddress.toLowerCase() === contractAddress.toLowerCase();
          });
      })
      .catch((error) => {
        console.error('Error verifying transaction:', error);
        return false; // Error occurred while verifying the transaction
      });
  }

// Start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Introduction message and image
  const introductionMessage = 'Welcome to the lottery bot!';
  const introductionImage = 'https://media.istockphoto.com/id/1010001882/vector/%C3%B0%C3%B0%C2%B5%C3%B1%C3%B0%C3%B1%C3%B1.jpg?s=612x612&w=0&k=20&c=1jeAr9KSx3sG7SKxUPR_j8WPSZq_NIKL0P-MA4F1xRw='; // Replace with the URL of your introduction image

  const opts = {
    reply_markup: {
      inline_keyboard: [[{ text: 'Start', callback_data: 'start' }]],
    },
  };

  bot.sendPhoto(chatId, introductionImage, { caption: introductionMessage, parse_mode: 'Markdown' });
  bot.sendMessage(chatId, 'Press the "Start" button to begin.', opts);
});

// Callback query handler for the "Start" button
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const queryData = query.data;

  if (queryData === 'start') {
    bot.sendMessage(chatId, 'Please enter your transaction hash:');
  }
});

// Message handler
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
  
    // Check if the message contains a BscScan address URL
    const regex = /https:\/\/bscscan\.com\/address\/(0x[0-9a-fA-F]{40})/;
    const match = text.match(regex);
  
    if (match && match[1]) {
      const txHash = match[1];
      const contractAddress = LOTTERY_CONTRACT_ADDRESS;

  // Verify the transaction
  verifyTransaction(txHash, contractAddress)
    .then((isTransactionValid) => {
      if (isTransactionValid) {
        const lotteryEntryMessage = 'Congratulations! You have entered the lottery. The result will be announced in the main channel.';

        bot.sendMessage(chatId, lotteryEntryMessage);

        // Share the main channel link
        const mainChannelLink = `https://t.me/${MAIN_CHANNEL_USERNAME}`;
        bot.sendMessage(chatId, `Join the main channel for updates: ${mainChannelLink}`);
        
        // Announce the lottery entry in the main channel
        const mainChannelMessage = `New lottery entry!\n\nUser: [${msg.from.first_name}](tg://user?id=${msg.from.id})\nTransaction: [View on Etherscan](https://etherscan.io/tx/${txHash})`;
        bot.sendMessage(`@${MAIN_CHANNEL_USERNAME}`, mainChannelMessage, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, 'Invalid transaction or token transfer not found.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      bot.sendMessage(chatId, 'An error occurred while verifying the transaction.');
    });
}
})


// Error handler
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});
