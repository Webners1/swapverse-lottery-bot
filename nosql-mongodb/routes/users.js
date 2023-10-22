const express = require('express');
const router = express.Router();
const Lottery = require('../models/Lottery');

// Add a wallet address to a lottery or create the lottery if it doesn't exist
router.post('/:IdNumber/add-wallet', async (req, res) => {
  try {
    const { address } = req.body;
    const IdNumber = req.params.IdNumber;

    // Try to find the lottery by its IdNumber
    let lottery = await Lottery.findOne({ IdNumber });

    // If the lottery doesn't exist, create it
    if (!lottery) {
      lottery = new Lottery({ IdNumber });
    }

    // Add the wallet address to the lottery
    if (!lottery.walletAddresses.includes(address)) {
      // Add the address to the array
      lottery.walletAddresses.push(address);
    await lottery.save();
    res.status(201).json(lottery);

    } else {
      // Handle the case where the address is already in the array
      res.status(400).json({ error: 'Duplicate wallet address' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch wallet addresses for a lottery by IdNumber
router.get('/:IdNumber/wallets', async (req, res) => {
  try {
    const IdNumber = req.params.IdNumber;
    const lottery = await Lottery.findOne({ IdNumber });

    if (!lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    res.json(lottery.walletAddresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
