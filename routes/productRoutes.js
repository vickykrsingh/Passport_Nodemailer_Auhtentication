const express = require("express");
const {
    getCategories,
    getCategoryByFamily,
    getProducts,
    getProductById,
    getProductsByFamily
} = require("../controllers/productController");

const router = express.Router();

router.get("/getCategories", getCategories);
router.get("/getCategory/:family", getCategoryByFamily);
router.get("/getProducts", getProducts);
router.get("/getProduct/:id", getProductById);
router.get("/getProducts/family/:family", getProductsByFamily);

module.exports = router;
