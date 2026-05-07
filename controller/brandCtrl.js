const asyncHandler = require("express-async-handler");
const Brand = require("../models/brandModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const getAllBrands = asyncHandler(async (req, res) => {
  //console.log(req.body);
  try {
    const brandData = await Brand.find({});
    res.status(200).json(brandData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brand offers data" });
  }
});

// New Controller to Render Brand Page
// New Controller to Render Brand Page
const getBrandPage = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const user = (await User.findOne({ refreshToken: token })) || " ";
  try {
    // Get category from query string (e.g. ?category=spare_parts)
    const category = req.query.category || "";

    let brandData = await Brand.find({});

    // Filter brands if category is present
    if (category) {
      const validBrands = await Product.distinct("brand", {
        category: category,
      });
      const validBrandsSet = new Set(validBrands.map((b) => b.toLowerCase()));
      brandData = brandData.filter((b) =>
        validBrandsSet.has(b.name.toLowerCase())
      );
    }

    if (!brandData) {
      return res.status(404).render("brand", {
        user: user,
        brands: [],
        category: category,
        error: "No brands found for this category",
      });
    }

    res.render("brand", {
      user: user,
      brands: brandData,
      category: category,
      pageTitle: category
        ? `${category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Brands – Sahii Mobile Spare Parts`
        : "All Brands – Sahii Mobile Spare Parts",
      pageDesc: `Find spare parts and accessories by brand at Sahii. Choose from Samsung, Apple, Xiaomi, OnePlus and more. Filter by category to find what you need.`,
      pageKeywords: `${category ? category.replace(/_/g, " ") + ", " : ""}mobile brands, spare parts brands, phone repair brands, sahii`,
      canonicalUrl: `https://sahii.in/brand/${category ? "?category=" + category : ""}`,
    });
  } catch (error) {
    console.error("Error in getBrandPage:", error);
    res.render("error", {
      user: user,
      error_msg: "Something went wrong while loading brands.",
    });
  }
});

const addBrands = asyncHandler(async (req, res) => {
  try {
    let { name } = req.body;

    let imagePath = req.file ? `/assets/brand/${req.file.filename}` : null;

    const existingBrand = await Brand.findOne({ name: name.trim() });
    if (existingBrand) {
      return res.redirect(`/admin?error=true&message=Brand already exists`);
    }

    await Brand.create({
      name: name.trim(),
      image: imagePath,
    });

    res.redirect(`/admin?success=true&message=Brand added successfully!`);
  } catch (error) {
    console.error(error);
    res.redirect(`/admin?error=true&message=Something went wrong`);
  }
});

// Get All models
const getModelsByBrand = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const user = (await User.findOne({ refreshToken: token })) || " ";
  try {
    const brandQuery = (req.query.brand || "").trim();
    // Capture category from query if present
    const category = req.query.category || "";

    if (!brandQuery) {
      return res.status(400).render("models", {
        brand: "",
        image: null,
        models: [],
        category: category,
        error: "Brand query is required. Example: /models?brand=xiaomi",
      });
    }

    // sanitize for regex
    const safe = brandQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${safe}$`, "i");

    // find the brand
    const brandDoc = await Brand.findOne({ name: regex })
      .select("name models image")
      .lean();

    if (!brandDoc) {
      return res.status(404).render("models", {
        brand: brandQuery,
        image: null,
        models: [],
        category: category,
        error: `Brand '${brandQuery}' not found`,
      });
    }

    // render page with models list
    // render page with models list

    let models = brandDoc.models;

    if (category) {
      const validModels = await Product.distinct("model", {
        brand: brandDoc.name.toLowerCase(),
        category: category,
      });

      // Check if 'general' is the ONLY model available (case-insensitive)
      const uniqueFoundModels = new Set(
        validModels.map((m) => m.toLowerCase())
      );
      if (uniqueFoundModels.size === 0) {
        return res.redirect(
          `/product/?brand=${brandDoc.name}&model=general&category=${category}`
        );
      }

      const validModelsSet = uniqueFoundModels;
      models = models.filter((m) => validModelsSet.has(m.name.toLowerCase()));

      // Explicitly check for 'general' model which might not be in the Brand schema
      if (validModelsSet.has("general")) {
        const alreadyHasGeneral = models.some(
          (m) => m.name.toLowerCase() === "general"
        );
        if (!alreadyHasGeneral) {
          models.push({
            name: "general",
            image: brandDoc.image, // Fallback to brand image if no specific model image
          });
        }
      }
    }

    return res.render("models", {
      user: user,
      brand: brandDoc.name,
      image: brandDoc.image,
      models: models,
      category: category,
      error: null,
      pageTitle: `${brandDoc.name} ${category ? category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) + " " : ""}Models – Sahii`,
      pageDesc: `Select your ${brandDoc.name} model to find compatible ${category ? category.replace(/_/g, " ") : "spare parts"} at Sahii. OEM-grade quality, fast delivery across India.`,
      pageKeywords: `${brandDoc.name} models, ${brandDoc.name} spare parts, ${category ? category.replace(/_/g, " ") + ", " : ""}sahii`,
      canonicalUrl: `https://sahii.in/brand/models?brand=${encodeURIComponent(brandDoc.name)}${category ? "&category=" + category : ""}`,
    });
  } catch (error) {
    console.error("Error in getModelsByBrand:", error);

    return res.render("error", {
      user: user,
      error_msg: "Something went wrong while loading models. Please try again.",
    });
  }
});

const addModels = asyncHandler(async (req, res) => {
  try {
    console.log("Brand BODY RECEIVED => ", req.body);

    let { brand, model } = req.body;

    const brandDoc = await Brand.findOne({ name: brand.trim() });

    if (!brandDoc) {
      return res.redirect(`/admin?error=true&message=Brand not found`);
    }

    // check if model already exists
    if (
      brandDoc.models.some(
        (m) => m.name.toLowerCase() === model.trim().toLowerCase()
      )
    ) {
      return res.redirect(`/admin?error=true&message=Model already exists`);
    }

    let modelImagePath = req.file
      ? `/assets/models/${req.file.filename}`
      : null;

    brandDoc.models.push({
      name: model.trim(),
      image: modelImagePath,
    });

    await brandDoc.save();

    res.redirect(`/admin?success=true&message=Model added successfully!`);
  } catch (error) {
    console.error(error);
    res.redirect(`/admin?error=true&message=Something went wrong`);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBrand = await Brand.findByIdAndDelete(id);
    if (!deletedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json({ message: "Brand deleted successfully", deletedBrand });
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand", error });
  }
});

const deleteModel = asyncHandler(async (req, res) => {
  const { brandId, modelName } = req.body; // or req.params if you prefer structure
  // Using body for simplicity since we need two identifiers: brandId and modelName(or ID)
  // Assuming model structure has _id, but current schema looks like object in array.
  // Ideally, models should have unique IDs. Let's assume user passes brandId and model ID/Name.

  // Actually, let's use route /model/:id and pass brandId in body or vice versa for cleaner REST?
  // Let's go with: POST /brand/deleteModel with body { brandId, modelName } for easiest implementation with current schema

  try {
    const brand = await Brand.findById(brandId);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    const initialLength = brand.models.length;
    brand.models = brand.models.filter((m) => m.name !== modelName);

    if (brand.models.length === initialLength) {
      return res.status(404).json({ message: "Model not found in this brand" });
    }

    await brand.save();
    res.json({ message: "Model deleted successfully", brand });
  } catch (error) {
    res.status(500).json({ message: "Error deleting model", error });
  }
});

module.exports = {
  getAllBrands,
  getBrandPage,
  addBrands,
  getModelsByBrand,
  addModels,
  deleteBrand,
  deleteModel,
};
