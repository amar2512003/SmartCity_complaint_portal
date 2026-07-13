const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: String,
    phone: Number,
    address: String,
    items: [
      {
        complaintId: String,
        title: String,
        serviceFee: Number,
      },
    ],
    totalAmount: Number,
    paymentMode: {
      type: String,
      default: "COD",
    },
    paymentStatus: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      default: "Confirmed",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("user-order", orderSchema);
