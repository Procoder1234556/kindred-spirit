const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const slugify = require("slugify");
const dotenv = require("dotenv");
const tinycolor = require("tinycolor2");
const iconv = require("iconv-lite");

// Load env vars
dotenv.config();

// -------------------- DB CONNECT --------------------
const dbConnect = async () => {
  try {
    if (!process.env.CONN_STR) throw new Error("CONN_STR is missing in .env");
    await mongoose.connect(process.env.CONN_STR);
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};

const Product = require("./models/productModel");

// -------------------- COLOR HANDLER --------------------
const getColorHex = (colorName) => {
  if (!colorName) return null;

  const c = tinycolor(colorName);
  if (c.isValid()) return c.toHexString();

  const cleaned = colorName.trim();
  const hexTry = tinycolor("#" + cleaned);
  if (hexTry.isValid()) return hexTry.toHexString();

  return null;
};

// -------------------- IMAGE PATH HANDLER --------------------
function processImage(csvPath) {
  if (
    !csvPath ||
    csvPath.trim() === "" ||
    ["null", "n/a", "undefined"].includes(csvPath.toLowerCase())
  ) {
    return null;
  }

  const cleanPath = csvPath.replace(/^"|"$/g, "").trim();
  const filename = path.basename(cleanPath);
  return `/assets/products/${filename}`;
}

// -------------------- CLEAN TITLE --------------------
function cleanTitle(title) {
  if (!title) return "";

  // Split by "-" and remove last part (color)
  const parts = title.split(" - ");
  if (parts.length > 1) {
    parts.pop(); // remove color
  }

  return parts.join(" - ").trim();
}

function normalizeText(text) {
  if (!text) return "";
  return text
    .replace(/\uFFFD/g, "") // removes � replacement char
    .normalize("NFKC")
    .trim();
}

// -------------------- IMPORT CSV --------------------
const importData = async () => {
  await dbConnect();

  const results = [];

  fs.createReadStream("only tools.csv")
    .pipe(iconv.decodeStream("win1252"))
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`🚀 Processing ${results.length} records...`);

      let successCount = 0;

      for (const row of results) {
        try {
          // ---------- TITLE ----------
          const cleanedTitle = normalizeText(cleanTitle(row.title));

          // ---------- MODEL ----------
          let model = row.model;
          if (model && model.trim().toLowerCase() === "same for all models") {
            model = "general";
          } else if (model) {
            model = model.toLowerCase();
          }

          // ---------- COLOR ----------
          let dbColor = [];
          if (row.color) {
            const hex = getColorHex(row.color);
            if (hex) dbColor.push(hex);
          }

          // ---------- IMAGES ----------
          const thumbnail =
            processImage(row.thumbnail) || processImage(row.img_g);

          let images = [];
          [
            "thumbnail",
            "img_1",
            "img_2",
            "img_3",
            "img_4",
            "img_5",
            "img_6",
          ].forEach((key) => {
            const imgPath = processImage(row[key]);
            if (imgPath && !images.includes(imgPath)) {
              images.push(imgPath);
            }
          });

          // ---------- SLUG ----------
          const slug = slugify(`${cleanedTitle} ${row.color || ""}`, {
            lower: true,
            strict: true,
          });

          // ---------- PRODUCT DATA ----------
          const productData = {
            title: cleanedTitle,
            slug,
            description: normalizeText(row.description) || cleanedTitle,
            sellingPrice: row.sellingprice || row.sellingPrice || 0,
            price: row.price || 0,
            quantity: row.quantity || 5000,
            discount: row.discount || 0,
            subCategory: row.subCategory || "",
            brand: row.brand ? row.brand.toLowerCase() : "sahii",
            model,
            category: "tools",
            color: dbColor,
            thumbnail: thumbnail || "",
            images,
          };

          // ---------- UPSERT ----------
          await Product.findOneAndUpdate({ slug }, productData, {
            upsert: true,
            new: true,
          });

          successCount++;
          if (successCount % 500 === 0) {
            console.log(`✅ Processed ${successCount} records`);
          }
        } catch (err) {
          console.error(`❌ Error importing "${row.title}":`, err.message);
        }
      }

      console.log(
        `🎉 Import finished. Successfully processed ${successCount} records.`
      );
      process.exit();
    });
};

importData();
