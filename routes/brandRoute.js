const express = require("express");
const { brandUpload, modelUpload } = require("../middlewares/upload.js");
const {
  getAllBrands,
  getBrandPage,
  addBrands,
  getModelsByBrand,
  addModels,
  deleteBrand,
  deleteModel,
} = require("../controller/brandCtrl");
const router = express.Router();

router.get("/", getBrandPage);
router.get("/getBrands", getAllBrands);
router.get("/models", getModelsByBrand);
router.post("/add", brandUpload, addBrands);
router.post("/addModel", modelUpload, addModels);

module.exports = router;

router.delete("/delete/:id", deleteBrand); // Delete Brand
router.post("/deleteModel", deleteModel); // Delete Model (using POST for body params ease)
