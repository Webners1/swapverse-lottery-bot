const TelegramBot = require('node-telegram-bot-api');
const Web3 = require('web3');
const axios = require('axios');
const Web3 = require('web3');
// Telegram Bot Token
const TELEGRAM_TOKEN = '6410417020:AAEqzwujcTj69QxfG1tiEdXAzJgr9TnuxaI';

const BASE_URL = 'swapverse-lottery-bot-production.up.railway.app'; // Replace with your API's actual base URL

const TOKEN_ADDRESS = "0xcFd5394699b97604aD27eB88Ebb8e6C038706015"
// Ethereum Node URL
const ETHEREUM_NODE_URL = 'https://bsc-testnet.public.blastapi.io';

// Lottery Contract Address
const LOTTERY_CONTRACT_ADDRESS = '0x06E223D115FF90F7AA3E61cb51520d9E0A05f38f';

// Main Telegram Channel
const MAIN_CHANNEL_USERNAME = 'swapverseresesre';


const lotter_Abi =[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "lotteryId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      }
    ],
    "name": "LotteryStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "lotteryId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "firstWinner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "firstPrize",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "secondWinner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "secondPrize",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "thirdWinner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "thirdPrize",
        "type": "uint256"
      }
    ],
    "name": "LotteryFinished",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "currentLotteryId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ... (other contract functions)
]
// Creating an instance of the Telegram Bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Create an instance of the Ethereum Web3 provider
const web3 = new Web3(ETHEREUM_NODE_URL);

// Function to verify if the user transferred tokens to the lottery contract
async function verifyTransaction(txHash, contractAddress = LOTTERY_CONTRACT_ADDRESS) {
  try {
    const transaction = await web3.eth.getTransaction(txHash);

    if (!transaction) {
      return false; // Transaction not found
    }

    // Check if the transaction is within the last 800 blocks
    const currentBlockNumber = await web3.eth.getBlockNumber();
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
    const from =  transaction.from
    if (tokenAddress === TOKEN_ADDRESS) {
      const tokenContract = new web3.eth.Contract(lotteryAbi, TOKEN_ADDRESS);
      const lotteryContract = new web3.eth.Contract(lotteryAbi, contractAddress);
      const IdNumber = await lotteryContract.methods.currentLotteryId().call();

      const response = await axios.post(`${BASE_URL}/lotteries/${IdNumber}/add-wallet`, { address: from });
      console.log('Added wallet address:', response.data);

      // Check if the recipient address is the contract address
      const balance = await tokenContract.methods.balanceOf(recipientAddress).call();
      return balance > 0 && recipientAddress.toLowerCase() === contractAddress.toLowerCase();
    }
    return false;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

// Start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Introduction message and image
  const introductionMessage = 'Welcome to the lottery bot!';
  const introductionImage = 'YOUR_INTRODUCTION_IMAGE_URL'; // Replace with your introduction image URL

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
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if the message contains a BscScan address URL
  const regex = /https:\/\/bscscan\.com\/tx\/(0x[0-9a-fA-F]{64})/;
  const match = text.match(regex);

  if (match && match[1]) {
    const txHash = match[1];

    // Verify the transaction
    verifyTransaction(txHash, LOTTERY_CONTRACT_ADDRESS)
      .then(async (isTransactionValid) => {
        if (isTransactionValid) {
          const lotteryEntryMessage = 'Congratulations! You have entered the lottery. The result will be announced in the main channel.';

          bot.sendMessage(chatId, lotteryEntryMessage);

          // Share the main channel link
          const mainChannelLink = `https://t.me/${MAIN_CHANNEL_USERNAME}`;
          bot.sendMessage(chatId, `Join the main channel for updates: ${mainChannelLink}`);

          // Announce the lottery entry in the main channel
          const mainChannelMessage = `New lottery entry!\n\nUser: [${msg.from.first_name}](tg://user?id=${msg.from.id})\nTransaction: [View on BscScan](https://bscscan.com/tx/${txHash})`;
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
});

// Error handler
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});