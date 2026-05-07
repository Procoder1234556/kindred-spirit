const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/productModel");

dotenv.config();

const FILES = [
  { name: "Only Spare parts.csv", category: "spare_parts" },
  { name: "only accessories.csv", category: "accessories" },
  { name: "only tools.csv", category: "tools" },
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.CONN_STR);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const parseLine = (line) => {
  // Simple CSV parser handling basic quotes: "value",value
  const parts = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // Handle double quotes inside quotes? usually ""
      if (inQuote && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (char === "," && !inQuote) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
};

const importProducts = async () => {
  await connectDB();

  for (const fileObj of FILES) {
    const filePath = `./${fileObj.name}`;
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    console.log(`Processing ${fileObj.name} ...`);

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/);

    if (lines.length < 2) continue;

    // Parse Headers
    const headerLine = lines[0];
    const headers = parseLine(headerLine).map((h) =>
      h.toLowerCase().replace(/\s+/g, " ").trim()
    );

    // Find Indices
    const idxTitle = headers.findIndex((h) => h.includes("product name"));
    const idxSelling = headers.findIndex((h) => h.includes("selling price"));
    const idxPrice = headers.findIndex((h) => h.includes("markup price")); // User said "markup price as price"
    const idxBrand = headers.findIndex((h) => h.includes("brand name"));
    const idxModel = headers.findIndex((h) => h.includes("model name")); // Check specific naming
    const idxColor = headers.findIndex((h) => h.includes("color"));
    const idxQty = headers.findIndex((h) => h.includes("quantity"));

    // Images: img_1, img_2 ...
    const idxImg1 = headers.findIndex(
      (h) => h.includes("img_1") || h === "img 1"
    );
    // Find all other images
    const imgIndices = [];
    headers.forEach((h, i) => {
      if (h.startsWith("img_") && i !== idxImg1) {
        imgIndices.push(i);
      }
    });

    // console.log('Headers:', headers);
    // console.log('Indices:', { idxTitle, idxSelling, idxPrice, idxBrand, idxModel, idxImg1 });

    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = parseLine(line);

      // Helper to safe get
      const getVal = (idx) =>
        idx !== -1 && parts[idx] ? parts[idx].replace(/^"|"$/g, "").trim() : "";

      const title = getVal(idxTitle);
      if (!title) continue;

      let model = getVal(idxModel);
      if (model.toLowerCase().includes("same for all models") || !model) {
        model = "general";
      }

      const sellingPrice = parseFloat(getVal(idxSelling)) || 0;
      const price = parseFloat(getVal(idxPrice)) || 0;
      const quantity = parseInt(getVal(idxQty)) || 100; // Default quantity
      const brand = getVal(idxBrand) || "General";
      const color = getVal(idxColor);

      // Images
      // User: "keep image path in db as product/image name"
      // File: "D:\...\filename.webp"
      // We need to extract basename "filename.webp" and prepend "product/"

      const processImgPath = (raw) => {
        if (!raw) return "";
        const base = path.basename(raw.replace(/\\/g, "/")); // Handle windows paths
        return `${base}`; // User said "product/image name"??
        // Wait: "keep image path in db as product/image name"
        // Usually means `product/foo.jpg`.
        // Let's assume `/assets/product/foo.jpg` to match standard or just `product/foo.jpg`?
        // The user said: "I will place directly them in public/assets/product folder"
        // So DB should probably point to `/assets/product/filename` or just `filename`?
        // Standard in this app seems to be `/assets/brand/...` or similar.
        // Re-reading: "keep image path in db as product/image name"
        // Maybe literal "product/image.jpg".
        return `product/${base}`;
      };

      const rawImg1 = getVal(idxImg1);
      const thumbnail = processImgPath(rawImg1);

      const images = [];
      imgIndices.forEach((idx) => {
        const val = getVal(idx);
        if (val) images.push(processImgPath(val));
      });

      // Upsert Product
      // Identify by slug or title? Title might be unique enough or we create a new one.
      // Let's check update based on title + model?

      const productData = {
        title,
        sellingPrice,
        price, // markup
        category: fileObj.category,
        brand,
        model,
        quantity,
        thumbnail,
        images,
        color: color ? [color] : [],
        description: title, // Default desc
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      };

      // console.log('Importing:', productData.title);

      await Product.findOneAndUpdate(
        { title: title }, // Match by title
        productData,
        { upsert: true, new: true }
      );

      count++;
    }
    console.log(`Imported ${count} products from ${fileObj.name}`);
  }

  console.log("Done.");
  process.exit();
};

importProducts();
