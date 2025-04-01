const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
app.use(cors()); // Cho phép tất cả các nguồn gốc
app.use(cors({ origin: 'http://localhost:8081' }));

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

// Để lưu OTP tạm thời (trong bộ nhớ hoặc DB)
let otpStore = {};

// Hàm tạo OTP ngẫu nhiên
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// Endpoint gửi OTP
app.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
    }

    // Tạo OTP
    const otp = generateOtp();
    otpStore[phoneNumber] = otp;

    try {
        // Gửi SMS qua API (ví dụ sử dụng Twilio)
        const response = await axios.post('https://api.twilio.com/2010-04-01/Accounts/ACb0a6ed5bdda0895a4df9e4aa6bed0ce5/Messages.json', {
            To: phoneNumber,
            From: '+84345596129',
            Body: `Mã OTP của bạn là: ${otp}`,
        }, {
            auth: {
                username: 'ACb0a6ed5bdda0895a4df9e4aa6bed0ce5',
                password: 'd4cb7f38c1c1438cbc6065e3dfc32c00',
            },
        });

        res.status(200).json({ message: 'OTP đã được gửi' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi gửi SMS' });
    }
});

// Endpoint xác thực OTP
app.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (otpStore[phoneNumber] && otpStore[phoneNumber] === otp) {
        return res.status(200).json({ message: 'Xác thực thành công' });
    }

    res.status(400).json({ error: 'OTP không hợp lệ' });
});

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
