const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const walletRoutes = require('./routes/users'); // Import your routes
require('dotenv').config();

const app = express();

// Parse incoming JSON data
app.use(bodyParser.json());
console.log(process.env.mongodb)
// MongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.mongodb)
  .then(() =>
   console.log("connected")
  )
  .catch((error) => console.log(`${error} Did not connect`));

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

// Use your wallet routes
app.use('/', walletRoutes);
app.use("/", (req, res) => res.status(200).send("Welcome to Oceasea Server"));

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
