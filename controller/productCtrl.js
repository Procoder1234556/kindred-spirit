const Product = require("../models/productModel");
const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const fs = require("fs");
const cloudinaryUploadImg = require("../utils/cloudinary");
const namer = require("color-namer");

const markProductSale = asyncHandler(async (req, res) => {
  const { slug } = req.body;
  try {
    const product = await Product.findOneAndUpdate(
      { slug: slug },
      { isSale: true },
      { new: true },
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

// Create Product
const createProduct = asyncHandler(async (req, res) => {
  try {
    const body = req.body;

    // -----------------------------
    // 1️⃣ Prepare slug
    // -----------------------------
    if (body.title && body.color) {
      body.slug = slugify(`${body.title} ${body.color}`, { lower: true });
    }

    if (Array.isArray(body.color)) {
      body.color = body.color.map((c) => (c.startsWith("#") ? c : `#${c}`));
    } else {
      body.color = body.color.startsWith("#") ? body.color : `#${body.color}`;
    }

    // -----------------------------
    // 2️⃣ CATEGORY mapping
    // -----------------------------
    const categories = {
      1: "spare_parts",
      2: "accessories",
      3: "tools",
    };

    if (req.body.category && categories[req.body.category]) {
      body.category = categories[req.body.category];
    }

    req.body.featured = req.body.featured === "true" ? true : false;
    req.body.isOriginal = req.body.isOriginal === "true" ? true : false;

    // -----------------------------
    // 3️⃣ Brand & Model already correct from frontend
    body.brand = body.brand.toLowerCase();
    body.model = body.model.toLowerCase();
    // -----------------------------

    // -----------------------------
    // 4️⃣ Fix negative quantity
    // -----------------------------
    if (body.quantity < 0) {
      body.quantity = Math.abs(body.quantity);
    }

    // -------------------------------------
    // 5️⃣ HANDLE FILE UPLOADS
    // -------------------------------------

    // THUMBNAIL
    let thumbnailPath = null;
    if (req.files && req.files.thumbnail) {
      thumbnailPath = `/assets/${req.files.thumbnail[0].filename}`;
    }

    // MULTIPLE IMAGES
    let images = [];
    if (req.files && req.files.images) {
      images = req.files.images.map((f) => `/assets/${f.filename}`);
    }

    // add in body
    body.thumbnail = thumbnailPath;
    body.images = images;

    // -----------------------------
    // 6️⃣ CREATE PRODUCT IN DB
    // -----------------------------
    const newProduct = await Product.create(body);

    // redirect to upload page
    // res.redirect(`/product/upload/${newProduct.id}`);
    res.redirect(`/admin?success=true&message=Product added successfully!`);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

// Update a Product
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const slug = req.body.slug;

    // -----------------------------
    // 1️⃣ CATEGORY mapping
    // -----------------------------
    const categories = {
      1: "spare_parts",
      2: "accessories",
      3: "tools",
    };

    if (req.body.category && categories[req.body.category]) {
      req.body.category = categories[req.body.category];
    }

    // -----------------------------
    // 2️⃣ Brand & Model Mapping
    // -----------------------------
    if (req.body.brand) req.body.brand = req.body.brand.toLowerCase();
    if (req.body.model) req.body.model = req.body.model.toLowerCase();

    // -----------------------------
    // 3️⃣ Boolean conversion
    // -----------------------------
    if (req.body.featured) {
      req.body.featured = req.body.featured === "true" ? true : false;
    }
    if (req.body.isOriginal) {
      req.body.isOriginal = req.body.isOriginal === "true" ? true : false;
    }

    const product = await Product.findOne({ slug: slug });

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // -----------------------------
    // 4️⃣ Field updates (fallbacks to existing)
    // -----------------------------
    const title = req.body.title || product.title;
    const description = req.body.description || product.description;
    const sellingPrice = req.body.sellingPrice || product.sellingPrice;
    const price = req.body.price || product.price;
    const discount = req.body.discount || product.discount;
    const quantity = req.body.quantity || product.quantity;
    const weight = req.body.weight || product.weight;
    const material = req.body.material || product.material;
    const dimension = req.body.dimension || product.dimension;
    const brand = req.body.brand || product.brand;
    const model = req.body.model || product.model;
    const category = req.body.category || product.category;
    const color = req.body.color
      ? req.body.color.startsWith("#")
        ? req.body.color
        : `#${req.body.color}`
      : product.color[0];
    const productLabel = req.body.productLabel || product.productLabel;
    const featured =
      req.body.featured !== undefined ? req.body.featured : product.featured;
    const isOriginal = req.body.isOriginal !== undefined ? req.body.isOriginal : product.isOriginal;

    // Find the product by ID and update it with the new data
    const newProduct = await Product.findOneAndUpdate(
      { slug: slug },
      {
        title,
        description,
        sellingPrice,
        price,
        discount,
        quantity,
        weight,
        material,
        dimension,
        brand,
        model,
        category,
        color,
        productLabel,
        featured,
        isOriginal,
      },
      { new: true }, // This option returns the updated document
    );

    if (newProduct) {
      res.json({
        success: true,
        message: "Product updated successfully",
        newProduct,
      });
    } else {
      res.json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update Images
const updateImages = asyncHandler(async (req, res) => {
  const slug = req.body.slug;
  const product = await Product.findOne({ slug });

  if (product) {
    const updateData = {};

    // Handle Thumbnail Upload
    if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
      updateData.thumbnail = `/assets/products/${req.files.thumbnail[0].filename}`;
    }

    // Handle Images Upload (Replaces existing gallery)
    if (req.files && req.files.images && req.files.images.length > 0) {
      updateData.images = req.files.images.map(
        (f) => `/assets/products/${f.filename}`,
      );
    }

    if (Object.keys(updateData).length > 0) {
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          $set: updateData,
        },
        { new: true },
      );
      console.log("Product Images Updated: ", updatedProduct.slug);
      res.json(updatedProduct);
    } else {
      res.json(product);
    }
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Delete a Product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params; // Here id will be the slug passed in URL
  try {
    const deleteProduct = await Product.findOneAndDelete({ slug: id });
    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product Deleted", deleteProduct });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a Product
const getaProduct = asyncHandler(async (req, res) => {
  // const { id } = req.params;
  const id = req.body.productId;
  //console.log("id is: " , id);
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// Get single Product
const getSingleProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const token = req.cookies?.refreshToken;
  const user = await User.findOne({ refreshToken: token });
  // const id = req.body.productId;
  //console.log("id is: " , id);
  try {
    let findProduct = await Product.findOne({ slug: slug });
    let allProducts = await Product.find({
      brand: findProduct.brand,
      slug: { $ne: slug },
    })
      .limit(8)
      .select(
        "title slug price sellingPrice images thumbnail discount quantity color",
      );

    // allProducts = allProducts.filter((item) => item.slug !== findProduct.slug); // Optimization: Handled in DB Query

    let allColors = await Product.find({ title: findProduct.title }).select(
      "color slug title",
    );

    allColors = allColors.map((prod) => {
      const hex = prod.color[0];

      // generate a readable name (e.g. "#ffd700" → "Gold")
      let name = "";
      try {
        name = colorNamer(hex).basic[0].name;
      } catch (e) {
        name = hex; // fallback
      }

      return {
        hex,
        name,
        slug: prod.slug,
      };
    });

    let selectedColorHex = findProduct.color[0];
    let selectedColorName = "";

    try {
      selectedColorName = namer(selectedColorHex).basic[0].name;
    } catch (err) {
      selectedColorName = selectedColorHex; // fallback
    }

    console.log("Products: ", findProduct.length, findProduct);
    // res.json(findProduct);

    //console.log(token);
    //console.log("Product is: ", findProduct);
    const coupons = await Coupon.find();

    // ── SEO variables ──
    const rawDesc = (findProduct.description || "").replace(/[<>]/g, "").slice(0, 155);
    const seoVars = {
      pageTitle: `${findProduct.title} – Buy Online | Sahii`,
      pageDesc: rawDesc
        ? `${rawDesc}...`
        : `Buy ${findProduct.title} online at Sahii. Genuine OEM-grade spare part for ${findProduct.brand || "your phone"} at a great price.`,
      pageKeywords: [
        findProduct.brand,
        findProduct.model,
        findProduct.subCategory,
        findProduct.category,
        findProduct.title,
        "spare parts",
        "buy online",
        "sahii",
      ]
        .filter(Boolean)
        .join(", "),
      canonicalUrl: `https://sahii.in/product/${findProduct.slug}`,
      ogImage: findProduct.images && findProduct.images[0]
        ? `https://sahii.in${findProduct.images[0]}`
        : "https://sahii.in/images/logo/logo.png",
      ogType: "product",
    };

    // -- Tracking Product View --
    try {
      const UserEvent = require('../models/userEventModel');
      await UserEvent.create({
        eventType: 'product_view',
        userId: user ? user._id : null,
        productId: findProduct._id,
        url: `/product/${findProduct.slug}` // Optional context
      });
    } catch(err) {
      console.log('Error logging product tracking:', err);
    }

    if (user) {
      res.render("sproduct", {
        product: findProduct,
        coupons: coupons,
        bearerToken: token,
        Id: findProduct._id,
        user: user,
        allProducts,
        allColors,
        selectedColorName,
        ...seoVars,
      });
    } else {
      res.render("sproduct", {
        product: findProduct,
        coupons: coupons,
        bearerToken: token,
        Id: findProduct._id,
        user: "",
        allProducts,
        allColors,
        selectedColorName,
        ...seoVars,
      });
    }
  } catch (error) {
    if (user) {
      res.render("error", { user, error_msg: "error1" });
    } else {
      res.render("error", { user: " ", error_msg: "error2" });
    }
  }
});

// Sort Descending (mirrors getAllProduct filtering, but with descending sort)
const sortDesc = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const user = await User.findOne({ refreshToken: token });

  try {
    // Base filtering (same exclusions as getAllProduct)
    const queryObj = { ...req.query };
    const excludeFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "fbclid",
      "gclid",
    ];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    let parsedQuery = JSON.parse(queryStr);

    // Handle comma-separated list fields (category/style/color/brand/model)
    const listFields = ["style", "color", "brand", "model", "category"];
    listFields.forEach((field) => {
      if (parsedQuery[field] && typeof parsedQuery[field] === "string") {
        const values = parsedQuery[field]
          .split(",")
          .filter((v) => v.trim() !== "");
        if (values.length > 0) {
          parsedQuery[field] = {
            $in: values.map((v) => {
              const escaped = v.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              return new RegExp(`^${escaped}$`, "i");
            }),
          };
        }
      }
    });

    // Apply generic case-insensitive regex for other string fields
    for (const key in parsedQuery) {
      if (listFields.includes(key)) continue;
      if (
        typeof parsedQuery[key] === "string" &&
        isNaN(Number(parsedQuery[key]))
      ) {
        parsedQuery[key] = { $regex: new RegExp(parsedQuery[key], "i") };
      }
    }

    // Special Model Logic (include 'general' fallback)
    if (parsedQuery.model) {
      const modelQuery = parsedQuery.model;
      parsedQuery.$or = [{ model: modelQuery }, { model: "general" }];
      delete parsedQuery.model;
    }

    // Exclude dummy brands
    if (!parsedQuery.brand) {
      parsedQuery.brand = { $nin: ["gift", "Dummy"] };
    } else {
      if (!parsedQuery.$and) parsedQuery.$and = [];
      parsedQuery.$and.push({ brand: { $nin: ["gift", "Dummy"] } });
    }

    let query = Product.find(parsedQuery).allowDiskUse(true);

    // Descending sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(`-${sortBy}`);
    } else {
      query = query.sort("-createdAt");
    }

    // For descending view we skip pagination and show all matching results
    const product = await query.exec();

    // ── Build SEO vars for descending listing page ──
    const brandParamD  = req.query.brand    || "";
    const catParamD    = req.query.category || "";
    let listingTitleD  = "Mobile Spare Parts";
    if (brandParamD) listingTitleD = `${brandParamD.charAt(0).toUpperCase() + brandParamD.slice(1)} ${catParamD ? catParamD.replace("_", " ") : "Spare Parts"}`;
    const descSeoVars = {
      pageTitle: `${listingTitleD} – Shop Now | Sahii`,
      pageDesc: `Shop ${listingTitleD.toLowerCase()} at Sahii. Genuine OEM-grade parts with fast delivery across India.`,
      pageKeywords: [brandParamD, catParamD, "spare parts", "buy online", "sahii"].filter(Boolean).join(", "),
      canonicalUrl: `https://sahii.in/product/desc?${new URLSearchParams(req.query).toString()}`,
    };

    if (product.length !== 0) {
      res.render("products", {
        user: user || " ",
        Products: product,
        token,
        ...descSeoVars,
      });
    } else {
      res.render("error", { user, error_msg: "Coming Soon" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// Get all Products
const getAllProduct = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const user = await User.findOne({ refreshToken: token });
  //console.log(user);
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "fbclid",
      "gclid",
      "type",
      "authenticity",
      "minPrice",
      "maxPrice",
    ];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let parsedQuery = JSON.parse(queryStr);

    // Handle comma-separated list fields
    const listFields = ["style", "color", "brand", "model", "category"];
    listFields.forEach((field) => {
      if (parsedQuery[field] && typeof parsedQuery[field] === "string") {
        const values = parsedQuery[field]
          .split(",")
          .filter((v) => v.trim() !== "");
        if (values.length > 0) {
          parsedQuery[field] = {
            $in: values.map((v) => {
              const escaped = v.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              return new RegExp(`^${escaped}$`, "i");
            }),
          };
        }
      }
    });

    // Apply generic case-insensitive regex for other string fields
    for (const key in parsedQuery) {
      if (listFields.includes(key)) continue; // Skip already handled fields
      if (
        typeof parsedQuery[key] === "string" &&
        isNaN(Number(parsedQuery[key]))
      ) {
        parsedQuery[key] = { $regex: new RegExp(parsedQuery[key], "i") };
      }
    }

    // Special Model Logic (include 'general' fallback)
    if (parsedQuery.model) {
      // If we have an existing model query (from list logic above), combine it
      const modelQuery = parsedQuery.model;
      parsedQuery.$or = [{ model: modelQuery }, { model: "general" }];
      delete parsedQuery.model;
    }

    // ── Type filter: spare_parts / accessories ──
    if (req.query.type && req.query.type !== "") {
      const typeMap = { spare_parts: "spare_parts", accessories: "accessories" };
      if (typeMap[req.query.type]) parsedQuery.category = typeMap[req.query.type];
    }

    // ── Authenticity filter: original / high_quality / all ──
    if (req.query.authenticity === "original") {
      parsedQuery.isOriginal = true;
    } else if (req.query.authenticity === "high_quality") {
      parsedQuery.isOriginal = { $ne: true };
    }

    // ── Price Range filter ──
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      parsedQuery.sellingPrice = {};
      if (!isNaN(minPrice)) parsedQuery.sellingPrice.$gte = minPrice;
      if (!isNaN(maxPrice)) parsedQuery.sellingPrice.$lte = maxPrice;
    }

    // Exclude dummy brands
    if (!parsedQuery.brand) {
      parsedQuery.brand = { $nin: ["gift", "Dummy"] };
    } else {
      if (!parsedQuery.$and) parsedQuery.$and = [];
      parsedQuery.$and.push({ brand: { $nin: ["gift", "Dummy"] } });
    }

    // Enable allowDiskUse to prevent "Sort exceeded memory limit"
    let query = Product.find(parsedQuery).allowDiskUse(true);

    // ── Sorting (popularity | rating | price_asc | price_desc | legacy) ──
    const sortParam = req.query.sort || "";
    if (sortParam === "popularity") {
      query = query.sort("-reviewCount -totalrating");
    } else if (sortParam === "price_asc" || sortParam === "sellingPrice") {
      query = query.sort("sellingPrice");
    } else if (sortParam === "price_desc") {
      query = query.sort("-sellingPrice");
    } else if (sortParam === "rating") {
      query = query.sort("-totalrating -reviewCount");
    } else if (sortParam !== "") {
      query = query.sort(sortParam.split(",").join(" "));
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Count distinct products matching the filters for pagination
    const expectedCount = await Product.countDocuments(parsedQuery);

    // Explicitly enabling disk usage for sorting large datasets
    let product = await query.allowDiskUse(true).exec();

    // removed client-side filter because we did it in query

    const totalPages = Math.ceil(expectedCount / limit);

    // ── Build SEO vars for listing page ──
    const brandParam   = req.query.brand    || "";
    const modelParam   = req.query.model    || "";
    const catParam     = req.query.category || "";
    let listingTitle   = "Mobile Spare Parts";
    if (brandParam) listingTitle = `${brandParam.charAt(0).toUpperCase() + brandParam.slice(1)} ${catParam ? catParam.replace("_", " ") : "Spare Parts"}`;
    else if (catParam) listingTitle = catParam.replace("_", " ").replace(/\b\w/g,  (c) => c.toUpperCase());
    const listingSeoVars = {
      pageTitle: `${listingTitle} – Buy Online | Sahii`,
      pageDesc: `Browse ${expectedCount} ${listingTitle.toLowerCase()} at Sahii. Genuine OEM-grade parts${brandParam ? ` for ${brandParam}` : ""} with fast delivery across India.`,
      pageKeywords: [brandParam, modelParam, catParam, "spare parts", "buy online", "sahii"].filter(Boolean).join(", "),
      canonicalUrl: `https://sahii.in/product/?${new URLSearchParams(req.query).toString()}`,
    };

    if (product.length !== 0 || page > 1) {
      const renderData = {
        user: user || " ",
        Products: product,
        token,
        currentPage: page,
        totalPages: totalPages,
        totalProducts: expectedCount,
        queryParams: req.query,
        ...listingSeoVars,
      };

      res.render("products", renderData);
    } else {
      res.render("error", { user: user, error_msg: "Coming Soon" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// Add to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  // const { _id } = req.user;
  const _id = req.body.userId;
  const prodId = req.body.prodId;
  // const { prodId } = req.body;
  try {
    // Guard against missing/invalid user id to avoid CastError
    if (!_id || typeof _id !== "string" || _id.trim() === "") {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const user = await User.findById(_id);
    if (user && user.email !== " ") {
      const alreadyadded = user.wishlist.find(
        (id) => id.toString() === prodId.toString(),
      );

      //console.log("Already in Wish: ", alreadyadded);
      if (!alreadyadded) {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $push: { wishlist: prodId },
          },
          {
            new: true,
          },
        );
        res.json({ user, message: "Added To WishList" });
      } else {
        res.json({ user, message: "Already Added" });
      }
      // res.json(user);
    } else {
      res.redirect("/myacc");
      // res.json({message: "Not Authorized"});
    }
  } catch (error) {
    throw new Error(error);
  }
});

// Remove wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  // const { _id } = req.user;
  const _id = req.body.userId;
  const prodId = req.body.prodId;
  // const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const newList = user.wishlist.filter(
      (id) => id.toString() !== prodId.toString(),
    );
    //console.log("Product Id: ", prodId);
    //console.log("New List: ", newList);

    User.findByIdAndUpdate(_id, { $set: { wishlist: newList } }, { new: true })
      .then((updatedUser) => {
        //console.log('Wishlist updated successfully');
        //console.log(updatedUser);
      })
      .catch((err) => {
        console.error("Error updating wishlist", err);
      });
    res.json(user);
  } catch (error) {
    throw new Error(error);
  }
});

// Get WishList
const getUserWish = asyncHandler(async (req, res) => {
  // const { _id } = req.user;
  const token = req.cookies?.refreshToken;
  const user = await User.findOne({ refreshToken: token });
  //   // validateMongoDbId(_id);
  try {
    if (user && user.email !== " ") {
      let wishlist = await Promise.all(
        user.wishlist.map(async (id) => {
          let product = await Product.findById(id);
          return product;
        }),
      );

      // Filter out null products (deleted from DB but still in user's wishlist)
      wishlist = wishlist.filter((item) => item !== null);

      wishlist.forEach((item) => {
        if (item.color && item.color.length > 0) {
          try {
            let colorCode = item.color[0];
            if (colorCode) {
              const colorInfo = namer(colorCode);
              item.color[0] = colorInfo.basic[0].name;
            }
          } catch (e) {
            // Ignore error, keep original color
          }
        }
      });
      console.log("Wishlist Products: ", wishlist);
      res.render("wishPage", { Wishlist: wishlist, user });
    } else {
      console.log("((((((((((((((((((((((((((((.)))))))))))))))))))))))))))");
      res.redirect("/myacc");
    }
  } catch (error) {
    throw new Error(error);
  }
});

// Ratings
const rating = asyncHandler(async (req, res) => {
  // const { _id } = req.user;
  const token = req?.cookies?.refreshToken;
  const { star, prodId } = req.body;
  const _id = await User.findOne({ refreshToken: token });

  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString(),
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star },
        },
        {
          new: true,
        },
      );
      res.json(updateRating);
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        },
      );
      res.json(rateProduct);
    }

    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalProduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true },
    );
    res.json(finalProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// Upload Images

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      //console.log(newpath);
      urls.push(newpath);
      // fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      },
    );
    //console.log("FindProduct: ", findProduct);
    res.redirect("/admin");
    // res.json(findProduct);
    // const images = urls.map((file) => {
    //   return file;
    // });
    // res.json(images);
  } catch (error) {
    throw new Error(error);
  }
});

// Set Product Style
const setStyle = asyncHandler(async (req, res) => {
  const type = req.body.styleType;
  const id = req.body.prodId;
  //console.log("++++", req.body, "++++");
  // const product = await Product.findById({'_id': id});
  const product = await Product.findByIdAndUpdate(
    id,
    {
      $push: { style: type },
    },
    { new: true },
    // (err, updatedStyle) => {
    //     if (err) {
    //         console.error('Error updating style:', err);
    //     } else {
    //         //console.log('Updated Style:', updatedStyle);
    //     }
    // }
  );
  //console.log(product);
  res.json(product);
  // res.redirect('/admin');
});

const handleStyle = asyncHandler(async (req, res) => {
  try {
    const token = req?.cookies?.refreshToken;
    const user = await User.findOne({ refreshToken: token });
    const userStyle = req.body;
    const queryString = userStyle.join(" ");
    res.redirect(`/search?search=${queryString}`);
  } catch (error) {
    res.redirect("/");
  }
});

//     const userProducts = [];
//     const products = await Product.find(); // Assuming Product is your Mongoose model
//     //console.log("Style: " ,userStyle);

//     if (!userStyle) {
//       return res.status(400).json({ error: 'Invalid user style' });
//     }

//     // // Convert userStyle elements to lowercase for case-insensitive comparison
//     // const userStyleLower = userStyle.map(s => s.toLowerCase());

//   //   // Loop through each product
//   //   products.forEach(product => {
//   //     // Convert product's style elements to lowercase for comparison
//   //     const productStyleLower = product.style.map(s => s.toLowerCase());

//   //     // Check if any element of userStyleLower matches with productStyleLower
//   //     if (userStyleLower.some(style => productStyleLower.includes(style))) {
//   //       userProducts.push(product);
//   //     }
//   //   });

//   //   //console.log('userProducts:', userProducts);
//   //   res.render('products', {user ,Products: userProducts, token});
//   //   // res.json({ userProducts });
//   // } catch (error) {
//   //   console.error('Error:', error);
//   //   res.status(500).json({ error: 'Internal Server Error' });
//   // }
//   const queryString = userStyle.map((item) => {

//   })
// });

const handlefilter = asyncHandler(async (req, res) => {
  try {
    const token = req?.cookies?.refreshToken;
    let user = await User.findOne({ refreshToken: token });
    const userStyle = req.body.style;
    const products = await Product.find();
    // Filter products based on userStyle
    const newProducts = products.filter((product) =>
      product.style.some(
        (style) => style.toLowerCase() === userStyle.toLowerCase(),
      ),
    );
    if (!user) {
      user = "-1";
    }
    //console.log(newProducts);
    // res.json(newStyle);
    res.render("filteredProduct", {
      user: user,
      Products: newProducts,
      style: userStyle.toLowerCase(),
    });
  } catch (error) {
    res.redirect("/");
  }
});

const bestSeller = asyncHandler(async (req, res) => {
  const token = req?.cookies?.refreshToken;
  let user = await User.findOne({ refreshToken: token });
  if (!user) {
    user = "-1";
  }

  try {
    const products = await Product.find();
    // Filter products based on userStyle
    const newProducts = products.filter(
      (product) => product.sellingPrice >= 649,
    );
    //console.log(newProducts);
    // res.json(newStyle);
    res.render("filteredProduct", {
      user: user,
      Products: newProducts,
      style: "best_seller",
    });
  } catch (error) {
    res.redirect("/");
  }
});

// Get All Products as JSON for Admin
// Get All Products as JSON for Admin
const getAllProductsJson = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find()
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getSingleProduct,
  sortDesc,
  getAllProduct,
  getAllProductsJson, // Added export
  updateProduct,
  updateImages,
  deleteProduct,
  addToWishlist,
  removeFromWishlist,
  getUserWish,
  rating,
  uploadImages,
  setStyle,
  handleStyle,
  handlefilter,
  bestSeller,
  markProductSale,
};
