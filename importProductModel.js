const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Brand = require("./models/brandModel");

dotenv.config();

const CSV_FILE = "./Model path and name file (1).csv";
const SOURCE_DIR = "./all brands sahii model images"; // Use local folder relative to root
const TARGET_DIR = "./public/assets/models";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.CONN_STR);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importModels = async () => {
  await connectDB();

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  try {
    const fileContent = fs.readFileSync(CSV_FILE, "utf-8");
    const lines = fileContent.split(/\r?\n/);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Start from index 1 to skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Format: """Path""",,Brand,Model
      // We can split by ',' but need to handle quotes if possible,
      // but here structure seems strict: "path",,Brand,Model
      // Let's use a regex to be safer or simple split if no commas in names.
      // Looking at the csv, model names might have commas? "Vivo S1 - Aug 2019" no comma.
      // "Oppo F9 (F9 Pro)" no comma.
      // "A5s - AX5s" no comma.

      // Simple split might work if empty column is always there
      // The format seems to be: "path",,Brand,ModelName

      // Let's parse manually
      const parts = line.split(",");
      if (parts.length < 4) {
        console.log(`Skipping invalid line ${i}: ${line}`);
        continue;
      }

      // Path is the first part, might span multiple because of split if path has commas (unlikely for file path provided)
      // But quoting is """path"""

      // Let's extract path first
      // The path starts with """ and ends with """
      const pathStartIndex = line.indexOf('"""');
      const pathEndIndex = line.lastIndexOf('"""');

      if (pathStartIndex === -1 || pathEndIndex === -1) {
        console.log(`Skipping malformed path line ${i}: ${line}`);
        continue;
      }

      const rawPath = line.substring(pathStartIndex + 3, pathEndIndex); // Remove """
      const restOfLine = line.substring(pathEndIndex + 3); // Skip """ and maybe following commas

      // restOfLine should be ",,Brand,Model"
      // clean leading commas
      const metaParts = restOfLine.split(",").filter((p) => p.trim() !== "");

      // We expect [Brand, Model] or maybe more if model name has commas?
      // "Vivo,Vivo U3" -> ["Vivo", "Vivo U3"]

      if (metaParts.length < 2) {
        console.log(`Skipping missing brand/model line ${i}: ${line}`);
        continue;
      }

      const brandName = metaParts[0].trim();
      // Model name is the rest joined back if it was split
      const modelName = metaParts.slice(1).join(",").trim();

      const fileName = path.basename(rawPath);
      const sourcePath = path.join(SOURCE_DIR, fileName);
      const targetPath = path.join(TARGET_DIR, fileName);
      const dbImagePath = `/assets/models/${fileName}`;

      // Check if Brand Exists
      const brand = await Brand.findOne({
        name: { $regex: new RegExp(`^${brandName}$`, "i") },
      });

      if (!brand) {
        console.log(`Brand not found: ${brandName} (Line ${i})`);
        errorCount++;
        continue;
      }

      // Check if Model Exists in Brand
      const modelExists = brand.models.find(
        (m) => m.name.toLowerCase() === modelName.toLowerCase()
      );

      if (modelExists) {
        // console.log(`Model already exists: ${brandName} -> ${modelName}`);
        skipCount++;
        continue;
      }

      // Copy Image
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      } else {
        console.log(`Image source missing: ${sourcePath}`);
        // We might still add the model with missing image or skip?
        // User said "upload in model", implies image is needed.
        // Let's try to proceed strictly? Or just log warning and add broken link?
        // Let's assume we proceed but log it.
      }

      // Add Model
      brand.models.push({
        name: modelName,
        image: dbImagePath,
      });

      await brand.save();
      console.log(`Added: ${brandName} -> ${modelName}`);
      successCount++;
    }

    console.log("------------------------------------------------");
    console.log(`Import Complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Skipped (Duplicate): ${skipCount}`);
    console.log(`Errors (Brand not found): ${errorCount}`);
    console.log("------------------------------------------------");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

importModels();
