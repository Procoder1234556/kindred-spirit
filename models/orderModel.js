const mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            title: String,
            image: String,
            count: Number,
            color: String,
            price: Number,
            sellingPrice: Number,
            discount: Number,
        },
    ],

    paymentIntent: {
        amount: Number,            // full order amount
        advancePaid: Number,       // advance charged online (COD) or full amount (ONLINE)
        remainingAmount: Number,   // amount - advancePaid for COD, else 0
        codAdvanceAmount: Number,  // computed: max(150, orderTotal * 0.05) — COD only
        razorpayOrderId: String,   // Razorpay order id
    },

    paymentMethod: {
        type: String,
        enum: ["ONLINE", "COD"],
        default: "ONLINE"
    },

    paymentStatus: {
        type: String,
        enum: ["UNPAID", "PARTIAL_PAID", "PAID"],
        default: "UNPAID"
    },

    isGiftWrap: { type: Boolean, default: false },

    orderStatus: {
        type: String,
        default: "Not Processed",
        enum: [
            "Not Processed",
            "Cash on Delivery",
            "Processing",
            "Dispatched",
            "Cancelled",
            "Delivered"
        ],
    },

    address: { type: Object },

    orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
