const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/productModel");

dotenv.config();

const verify = async () => {
  try {
    await mongoose.connect(process.env.CONN_STR);
    console.log("DB Connected");

    // Find a product with non-zero discount or checks accelerator IC again
    const product = await Product.findOne({
      title: /Accelerator IC for Apple iPhone 6s Plus/i,
    });
    // console.log("Product:", JSON.stringify(product, null, 2));

    // Find one with discount if possible
    const discounted = await Product.findOne({ discount: { $gt: 0 } });
    if (discounted) {
      // console.log("Discounted Product:", JSON.stringify(discounted, null, 2));
    }

    // Find one with subCategory
    const subCat = await Product.findOne({ subCategory: { $ne: "" } });
    if (subCat) {
      // console.log("SubCategory Product:", JSON.stringify(subCat, null, 2));
    }

    // Find product with colors
    const coloredProduct = await Product.findOne({
      "color.0": { $exists: true },
    });
    if (coloredProduct) {
      console.log(
        "Sample Product with Color:",
        JSON.stringify(
          {
            title: coloredProduct.title,
            color: coloredProduct.color,
          },
          null,
          2
        )
      );
    } else {
      console.log("No products with color found.");
    }

    const countColored = await Product.countDocuments({
      "color.0": { $exists: true },
    });
    console.log(`Total Products with Color: ${countColored}`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verify();
