const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
    },
    expiry:{
        type:Date,
        required:true,
    },
    discount:{
        type:Number,
        required:true,
    },
    minValue:{
        type:Number,
        default:null,
    },
    maxValue:{
        type:Number,
        default:null,
    },
});

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);