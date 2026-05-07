const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/productModel");

dotenv.config();

const verifyImport = async () => {
  try {
    await mongoose.connect(process.env.CONN_STR);
    console.log("DB Connected");

    const product = await Product.findOne({
      title: /Accelerator IC for Apple Iphone 6S Plus/i,
    });
    console.log("Product:", JSON.stringify(product, null, 2));

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verifyImport();
