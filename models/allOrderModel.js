const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var allOrderSchema = new mongoose.Schema({
    totalAmount: Number,

    orderStatus: String,

    orders: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            title: String,
            image: String,
            count: Number,
            color: String,
            price: Number,
            sellingPrice: Number,
            discount: Number,
            orderStatus: { type: String, default: "Processing" },
        },
    ],

    address: Object,

    isGiftWrap: { type: Boolean, default: false },

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

    paymentIntent: {
        amount: Number,
        advancePaid: Number,
        remainingAmount: Number,
        razorpayOrderId: String
    },

    orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true });

//Export the model
module.exports = mongoose.model('AllOrder', allOrderSchema);