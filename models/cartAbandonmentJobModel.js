const mongoose = require('mongoose');

const cartAbandonmentJobSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    productName: { type: String, required: true },
    cartUrl: { type: String, required: true },
    scheduledTimes: { type: [Date], required: true },
    messagesSent: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model("CartAbandonmentJob", cartAbandonmentJobSchema);
