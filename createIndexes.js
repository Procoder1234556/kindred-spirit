const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const dbConnect = async () => {
  try {
    if (!process.env.CONN_STR) throw new Error("CONN_STR is missing in .env");
    await mongoose.connect(process.env.CONN_STR);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  await dbConnect();

  // We need to access the collection directly or use Schema.index
  // Using collection direct access is often faster for one-off scripts
  try {
    const Product = require("./models/productModel");

    console.log("Creating indexes...");

    // 1. Index for default sort (createdAt)
    console.log("Indexing createdAt...");
    await Product.collection.createIndex({ createdAt: -1 });

    // 2. Index for Category + Sort/Filter
    console.log("Indexing category + createdAt...");
    await Product.collection.createIndex({ category: 1, createdAt: -1 });

    console.log("Indexing category + sellingPrice...");
    await Product.collection.createIndex({ category: 1, sellingPrice: 1 });

    console.log("Indexing category + brand...");
    await Product.collection.createIndex({ category: 1, brand: 1 });

    // 3. Index for Brand + Sort
    console.log("Indexing brand + createdAt...");
    await Product.collection.createIndex({ brand: 1, createdAt: -1 });

    // 4. Index for SubCategory
    console.log("Indexing subCategory...");
    await Product.collection.createIndex({ subCategory: 1 });

    // 5. Text index for Title (if Title search is used)
    console.log("Indexing title...");
    await Product.collection.createIndex({ title: 1 });

    // 6. Detailed Field Indexes
    console.log("Indexing sellingPrice...");
    await Product.collection.createIndex({ sellingPrice: 1 });

    console.log("Indexing price...");
    await Product.collection.createIndex({ price: 1 });

    console.log("Indexing color (multikey)...");
    await Product.collection.createIndex({ color: 1 });

    console.log("Indexing style (multikey)...");
    await Product.collection.createIndex({ style: 1 });

    console.log("Indexing model...");
    await Product.collection.createIndex({ model: 1 });

    // 7. Slug
    console.log("Indexing slug...");
    await Product.collection.createIndex({ slug: 1 }, { unique: true });

    console.log("All Indexes Created Successfully.");
  } catch (err) {
    console.error("Error creating indexes:", err);
  }

  process.exit();
};

createIndexes();
