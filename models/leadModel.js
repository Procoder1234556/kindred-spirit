const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
