const twilio = require('twilio');

// Thông tin tài khoản Twilio của bạn
const accountSid = 'ACb0a6ed5bdda0895a4df9e4aa6bed0ce5';
const authToken = '1f67da20f4bcf724c00a2003a07036ee';
const client = new twilio(accountSid, authToken);

function sendOtp(phoneNumber, otp) {
    return client.messages.create({
        body: `Your OTP is: ${otp}`,
        to: phoneNumber,  // Số điện thoại của người nhận
        from: '+84345596129' // Số điện thoại Twilio của bạn
    });
}

module.exports = { sendOtp };
