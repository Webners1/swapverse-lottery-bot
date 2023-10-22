// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AutomaticLottery {
    address public manager;
    uint256 public lastLotteryStartTime;
    uint256 public lotteryDuration = 6 hours;
    uint256 public currentLotteryId;
    bool public lotteryInProgress;
    uint256 public entranceFee = 5; // Minimum token requirement for entrance
    
    IERC20 public token; // The ERC-20 token contract

    mapping(uint256 => address[]) public lotteryWinners;

    event LotteryStarted(uint256 indexed lotteryId, uint256 startTime);
    event LotteryFinished(uint256 indexed lotteryId, address firstWinner, uint256 firstPrize, address secondWinner, uint256 secondPrize, address thirdWinner, uint256 thirdPrize);
    constructor(address _tokenAddress) {
        manager = msg.sender;
        token = IERC20(_tokenAddress);
        lastLotteryStartTime = block.timestamp;
        currentLotteryId = 1;
        lotteryInProgress = false;
    }

    function startNewLottery() public restricted {
        require(!lotteryInProgress, "A lottery is already in progress");
        require(block.timestamp >= lastLotteryStartTime + lotteryDuration, "It's not time to start a new lottery yet");

        // Reset the last lottery start time, increment the lottery ID, and set lotteryInProgress to true
        lastLotteryStartTime = block.timestamp;
        currentLotteryId++;
        lotteryInProgress = true;

        emit LotteryStarted(currentLotteryId, lastLotteryStartTime);
    }

  

   function distributePrizes(address[] memory winners) public restricted {
    require(lotteryInProgress, "No lottery in progress");
    require(winners.length == 3, "There should be exactly 3 winners");

    // Calculate rewards based on the total balance minus the fees
    uint256 totalBalance = token.balanceOf(address(this));
    uint256 totalRewards = totalBalance * 95 / 100; // 5% fee deducted

    uint256 firstPrize = (totalRewards * 50) / 100;
    uint256 secondPrize = (totalRewards * 30) / 100;
    uint256 thirdPrize = (totalRewards * 20) / 100;

    // Store the winners for the current lottery
    lotteryWinners[currentLotteryId] = winners;

    // Transfer prizes to the winners
    require(token.transfer(winners[0], firstPrize), "Token transfer failed");
    require(token.transfer(winners[1], secondPrize), "Token transfer failed");
    require(token.transfer(winners[2], thirdPrize), "Token transfer failed");

    // Mark the current lottery as finished and emit an event with individual prizes
    lotteryInProgress = false;
    emit LotteryFinished(currentLotteryId, winners[0], firstPrize, winners[1], secondPrize, winners[2], thirdPrize);
}


    function getLotteryInfo(uint256 lotteryId) public view returns (address[] memory) {
        return lotteryWinners[lotteryId];
    }

    modifier restricted() {
        require(msg.sender == manager, "Only the manager can call this function");
        _;
    }
}
