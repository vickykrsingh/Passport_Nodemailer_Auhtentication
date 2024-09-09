const poolDB = require("../config/db");

// Get all categories
const getCategories = async (req, res, next) => {
    try {
        const categories = await poolDB.query("SELECT DISTINCT ON (category__c) category__c, cover_photo__c, family__c FROM bayavasfdc.products__c");
        res.status(200).json({ msg: "Success", data: categories.rows });
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Get categories by family
const getCategoryByFamily = async (req, res, next) => {
    try {
        const { family } = req.params;
        const categoriesQuery = `
            SELECT 
                category__c, 
                json_agg(sub_category__c) AS sub_categories
            FROM bayavasfdc.products__c 
            WHERE family__c = $1 
            GROUP BY category__c;
        `;
        const categories = await poolDB.query(categoriesQuery, [family]);

        const formattedCategories = categories.rows.map(row => ({
            category__c: row.category__c,
            subCategories: row.sub_categories.map(subCategory => ({ subCategory__c: subCategory }))
        }));

        res.status(200).json({ msg: "Success", data: formattedCategories });
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Get all products
const getProducts = async (req, res, next) => {
    try {
        const products = await poolDB.query("SELECT * FROM bayavasfdc.products__c");
        res.status(200).json({ msg: "Success", data: products.rows });
    } catch (error) {
        res.status(500).json({ msg: "Failed", error: error.message });
    }
};

// Get product by ID
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await poolDB.query("SELECT * FROM bayavasfdc.products__c WHERE id = $1", [id]);
        res.status(200).json({ msg: "Success", data: product.rows });
    } catch (error) {
        res.status(500).json({ msg: "Failed", error: error.message });
    }
};

// Get products by family
const getProductsByFamily = async (req, res, next) => {
    try {
        const { family } = req.params;
        const products = await poolDB.query("SELECT * FROM bayavasfdc.products__c WHERE family__c = $1", [family]);
        res.status(200).json({ msg: "Success", data: products.rows });
    } catch (error) {
        res.status(500).json({ msg: "Failed", error: error.message });
    }
};

module.exports = {
    getCategories,
    getCategoryByFamily,
    getProducts,
    getProductById,
    getProductsByFamily
};
