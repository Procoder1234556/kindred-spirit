const Brand = require('../models/brandModel');

const fetchBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({}).lean();
    res.locals.brands = brands;
    next();
  } catch (error) {
    console.error('Error fetching brands in middleware:', error);
    res.locals.brands = [];
    next();
  }
};

module.exports = { fetchBrands };
