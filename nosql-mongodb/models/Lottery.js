const mongoose = require('mongoose');

const lotterySchema = new mongoose.Schema({
  IdNumber: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddresses: [
    {
      type: String,
      unique: true,
    },
  ],
});

const Lottery = mongoose.model('Lottery', lotterySchema);

module.exports = Lottery;
