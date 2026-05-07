const express = require("express");
const router = express.Router();
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const slugify = require("slugify");
const { isAdmin } = require("../middlewares/authMiddleware");

// Setup Multer for memory storage since we just need to parse it
const upload = multer({ storage: multer.memoryStorage() });

// Helper to safely parse numbers
const parseNum = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

// @desc    Render Bulk Products page
// @route   GET /admin/bulk-products
// @access  Admin
router.get("/", isAdmin, (req, res) => {
  res.render("bulkProductAdmin");
});

// @desc    Upload CSV for Bulk Create/Update
// @route   POST /admin/bulk-products/upload
// @access  Admin
router.post(
  "/upload",
  isAdmin,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Parse CSV
      const csvData = req.file.buffer.toString("utf8");
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      let created = 0;
      let updated = 0;
      let failed = 0;

      for (const record of records) {
        try {
          // Expected cols: brand, model, sparePartCategory, productName, quality, actualPrice, markupPrice, discount, stockQuantity, description, imageUrl, colors
          const brand = (record.brand || "").trim().toLowerCase();
          const model = (record.model || "").trim().toLowerCase();
          const title = (record.productName || "").trim();
          const pColor = (record.colors || "").trim();

          if (!brand || !model || !title) {
            failed++;
            continue;
          }

          const slugString = pColor ? `${title} ${pColor}` : title;
          const slug = slugify(slugString, { lower: true });

          const productData = {
            title,
            slug,
            description: record.description || "",
            price: parseNum(record.actualPrice),
            sellingPrice: parseNum(record.markupPrice),
            discount: parseNum(record.discount),
            category: record.sparePartCategory || "spare_parts",
            subCategory: record.sparePartCategory || "spare_parts",
            brand,
            model,
            quantity: parseNum(record.stockQuantity),
            isOriginal: (record.quality || "").toLowerCase() === "og",
            productLabel: record.quality || "High Quality",
            color: pColor ? [pColor] : [],
          };

          if (record.imageUrl) {
            productData.thumbnail = record.imageUrl;
            productData.images = [record.imageUrl];
          }

          // Upsert logic: attempt to find by title AND model AND color
          let query = { title, model };
          if (pColor) query.color = { $in: [pColor] };

          const existingProduct = await Product.findOne(query);

          if (existingProduct) {
             await Product.findByIdAndUpdate(existingProduct._id, productData);
             updated++;
          } else {
             await Product.create(productData);
             created++;
          }
        } catch (e) {
          console.error("Row error:", e);
          failed++;
        }
      }

      res.json({
        success: true,
        message: "Upload processed successfully",
        created,
        updated,
        failed,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to parse CSV file." });
    }
  })
);

// @desc    Bulk Edit Products
// @route   POST /admin/bulk-products/edit
// @access  Admin
router.post(
  "/edit",
  isAdmin,
  asyncHandler(async (req, res) => {
    const { filterBrand, filterCategory, editAction, editValue } = req.body;

    const query = {};
    if (filterBrand) query.brand = filterBrand.toLowerCase();
    if (filterCategory) query.category = filterCategory;

    // Build the update query dynamically
    let updateQuery = {};
    const valObj = parseNum(editValue);

    switch (editAction) {
      case "increase_price_percent":
         // requires an aggregation pipeline update if doing math, 
         // but mongoose updateMany can use pipelined updates in v4.2+ 
         updateQuery = [ { $set: { sellingPrice: { $add: [ "$sellingPrice", { $multiply: [ "$sellingPrice", parseFloat(editValue)/100 ] } ] } } } ];
         break;
      case "set_discount":
         updateQuery = { discount: valObj };
         break;
      case "update_stock":
         updateQuery = { quantity: valObj };
         break;
      case "set_is_sale":
         updateQuery = { isSale: (editValue === "true" || editValue === "1") };
         break;
      default:
         return res.status(400).json({ error: "Invalid edit action" });
    }

    try {
       const result = await Product.updateMany(query, updateQuery);
       res.json({
           success: true,
           updated: result.modifiedCount,
           matched: result.matchedCount
       });
    } catch (error) {
       console.error("Bulk update failed:", error);
       res.status(500).json({ error: "Failed to execute bulk update." });
    }
  })
);

module.exports = router;
