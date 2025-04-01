require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Lưu OTP tạm thời (nên dùng Redis/DB thay vì object)
let otpStore = {};

// Hàm tạo OTP ngẫu nhiên
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// 🟢 Endpoint gửi OTP
app.post("/send-otp", async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
    }

    // Tạo OTP và lưu tạm
    const otp = generateOtp();
    otpStore[phoneNumber] = otp;

    try {
        // Gửi SMS qua API Twilio
        const response = await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
            new URLSearchParams({
                To: phoneNumber,
                From: process.env.TWILIO_PHONE_NUMBER,
                Body: `Mã OTP của bạn là: ${otp}`,
            }),
            {
                auth: {
                    username: process.env.TWILIO_ACCOUNT_SID,
                    password: process.env.TWILIO_AUTH_TOKEN,
                },
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        res.status(200).json({ message: "OTP đã được gửi" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi gửi SMS", details: error.message });
    }
});

// 🔵 Endpoint xác thực OTP
app.post("/verify-otp", (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (otpStore[phoneNumber] && otpStore[phoneNumber] == otp) {
        delete otpStore[phoneNumber]; // Xóa OTP sau khi dùng
        return res.status(200).json({ message: "Xác thực thành công" });
    }

    res.status(400).json({ error: "OTP không hợp lệ hoặc đã hết hạn" });
});

// 🏃‍♂️ Chạy server
app.listen(port, () => {
    console.log(`✅ Server chạy tại: http://localhost:${port}`);
});
