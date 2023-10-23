const express = require('express');
const bodyParser = require('body-parser');
const { default: sendWinnersMessage } = require('./winner');

const app = express();
const port = 3000; // Replace with your desired port

app.use(bodyParser.json());

// Define your webhook endpoint to receive lottery data
app.post('/lottery', (req, res) => {
  const { lotteryId, winners } = req.body;

  if (lotteryId && winners) {
    // Pass the lottery data to the sendWinnersMessage function
    sendWinnersMessage(lotteryId, winners);
    res.sendStatus(200);
  } else {
    res.status(400).send('Bad Request');
  }
});


app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
