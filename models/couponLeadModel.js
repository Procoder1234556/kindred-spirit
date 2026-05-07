const mongoose = require("mongoose");

const couponLeadSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    couponCode: {
      type: String,
      default: "SAHII10",
      trim: true,
    },
    source: {
      type: String,
      default: "homepage_popup",
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CouponLead", couponLeadSchema);
