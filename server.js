const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const app = express(); // Initialize the app

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Use express.json() to parse incoming JSON data
app.use(express.json());

const port = 3000; // Use the port provided by Render, or default to 3000

// Twilio setup: Set your Twilio Account SID and Auth Token here
const accountSid = 'ACb0a6ed5bdda0895a4df9e4aa6bed0ce5';
const authToken = '1f67da20f4bcf724c00a2003a07036ee';
const client = new twilio(accountSid, authToken);

// Set your Twilio phone number here
const twilioPhoneNumber = '+84345596129';

// Endpoint for sending OTP
app.post('/send-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;

  // Validate the input data
  if (!phoneNumber || !otp) {
    return res.status(400).send('Phone number and OTP are required');
  }

  client.messages.create({
    body: `Your OTP is: ${otp}`,
    to: phoneNumber,
    from: twilioPhoneNumber,
  })
  .then(message => res.status(200).send(`OTP sent! Message SID: ${message.sid}`))
  .catch(error => res.status(500).send(`Failed to send OTP: ${error.message}`));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
