const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
  eventType: { 
    type: String, 
    enum: ['page_view', 'product_view', 'add_to_cart'],
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  url: {
    type: String
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  },
  quantity: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('UserEvent', userEventSchema);
