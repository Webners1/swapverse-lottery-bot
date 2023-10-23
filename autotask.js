const Web3 = require('web3');
const axios = require('axios');

// Define the base URL for your API
const baseURL = 'swapverse-lottery-bot-production.up.railway.app'; // Replace with your API's actual base URL

// Function to add a wallet address to a lottery
async function addWalletToLottery(IdNumber, address) {
  try {
    const response = await axios.post(`${baseURL}/lotteries/${IdNumber}/add-wallet`, { address });
    console.log('Added wallet address:', response.data);
  } catch (error) {
    console.error('Error adding wallet address:', error.response.data);
  }
}

// Function to fetch wallet addresses for a lottery
async function getWalletsForLottery(IdNumber) {
  try {
    const response = await axios.get(`${baseURL}/lotteries/${IdNumber}/wallets`);
    return response.data
  } catch (error) {
    console.error('Error fetching wallet addresses:', error.response.data);
  }
}
// Replace with your contract addresses and private key
const PUBLIC_KEY = "0x61bEE7b65F860Fe5a22958421b0a344a0F146983";
const PRIVATE_KEY = "a3d3f11bfe51468f16efbb6f15d2f3dd33eee513241812c401196aeb538e2842";
const CONTRACT_ADDRESS = "0x7dcdD0611C46972b0DD9B4758d4B514F7a1de035";

// ABI for the lottery contract
const LotteryAbiWeekly =[
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
  
  function selectRandomWinners(participants, numWinners) {
    const shuffled = participants.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numWinners);
  }
  
  exports.handler = async function (event) {
    const web3 = new Web3('https://eth-goerli.g.alchemy.com/v2/CFKeOAiXYkjT6o-18rkEdSClaM6zdPYl');
    const LOTTERY_CONTRACT = new web3.eth.Contract(LotteryAbiWeekly, CONTRACT_ADDRESS);
    const lotteryId = await LOTTERY_CONTRACT.methods.currentLotteryId().call();
    const participants = await getWalletsForLottery(lotteryId);
  
    if (participants.length < 3) {
      console.error('Not enough participants to select winners.');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Not enough participants to select winners." }),
      };
    }
  
    // Select three random winners from the array
    const randomWinners = selectRandomWinners(participants, 3);
  
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest');
    const gasEstimate = await LOTTERY_CONTRACT.methods.distributePrizes(randomWinners).estimateGas({ from: PUBLIC_KEY });
  
    const tx = {
      from: PUBLIC_KEY,
      to: CONTRACT_ADDRESS,
      nonce: nonce,
      gas: gasEstimate,
      data: LOTTERY_CONTRACT.methods.distributePrizes(randomWinners).encodeABI(),
    };
    const signPromise = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  
    try {
      const receipt = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
      console.log("Winner selection transaction hash:", receipt.transactionHash);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Winner selection completed." }),
      };
    } catch (error) {
      console.error("Error selecting winner:", error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error selecting winner." }),
      };
    }
  };