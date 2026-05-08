const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    if (!process.env.CONN_STR) {
      throw new Error("CONN_STR is missing in .env");
    }
    await mongoose.connect(process.env.CONN_STR);
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
  }
};

module.exports = dbConnect;
