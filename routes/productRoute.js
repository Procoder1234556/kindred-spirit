const express = require("express");
const {
  createProduct,
  getaProduct,
  getSingleProduct,
  getAllProduct,
  getAllProductsJson,
  updateProduct,
  deleteProduct,
  addToWishlist,
  getUserWish,
  rating,
  uploadImages,
  removeFromWishlist,
  updateImages,
  setStyle,
  handleStyle,
  handlefilter,
  bestSeller,
  sortDesc,
  markProductSale,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { productUpload, uploadPhoto } = require("../middlewares/upload.js");
const router = express.Router();

// router.post("/", authMiddleware, isAdmin, createProduct);
// router.put("/upload/:id", authMiddleware, isAdmin,  uploadPhoto.array("images", 10), productImgResize, uploadImages);
router.post("/", productUpload, createProduct);
router.get("/upload/:id", (req, res) => {
  res.render("uploadPhoto", { id: req.params.id });
});
// router.post("/upload", uploadPhoto.array("images", 10),(req,res) => {res.send("success");} );
// router.post("/upload/:id", uploadPhoto.array("images", 10), productImgResize, uploadImages);
router.post("/upload/:id", uploadPhoto.array("images", 10), uploadImages);
router.post("/getproductById", getaProduct);
router.post("/addWishlist", addToWishlist);
router.post("/removeWishlist", removeFromWishlist);
router.post("/updateImages", productUpload, updateImages);
router.post("/update", updateProduct);
router.get("/wishlist", getUserWish);
router.get("/best_sellers", bestSeller);
// router.post('/wishlist', authMiddleware, addToWishlist);
router.post("/rating", rating);
router.delete("/:id", deleteProduct);
router.get("/admin/all-products", getAllProductsJson);
router.get("/", getAllProduct);
router.get("/desc", sortDesc);
// router.post("/setStyle", setStyle);
router.post("/style", handleStyle);
router.post("/filter", handlefilter);
router.post("/mark-sale", markProductSale);
router.get("/:slug", getSingleProduct);

module.exports = router;
