const crypto = require("crypto");
const express = require('express');
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const dotenv = require('dotenv');
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

//order create

router.post('/create-order', async (req, res) => {
    try {
        const { totalAmount } = req.body;
        const option = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "receipt_" + Date.now()
            
        };
        const order = await razorpay.orders.create(option);
        res.json({
            key: process.env.RAZORPAY_KEY_ID,
            order
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//verify payment and save order
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            customerName,
            phone,
            address,
            items,
            totalAmount,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        
        } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        //signature verify
        const exceptedsignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");
        
        if (exceptedsignature !== razorpay_signature) {
            return res.status(400).json({ message: "payment fail" });
        }

        const order = await Order.create({
            customerName,
            phone,
            address,
            items,
            totalAmount,
            paymentMode: "Razorpay",
            paymentStatus: "Paid",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
            
        });
        res.json({
           message:"payment successfull",
            order
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find();
        res.json({ orders });

    } catch (err) {
        res.status(500).json({ message: err.message });

    }
});

module.exports = router;
