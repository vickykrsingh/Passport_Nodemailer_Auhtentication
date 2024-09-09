const poolDB = require("../config/db");

// Get all healers
const getHealers = async (req, res, next) => {
    try {
        const healers = await poolDB.query('SELECT * FROM bayavasfdc.teacher__c WHERE "type__c" = $1', ['Parampara Healer']);
        res.status(200).json(healers);
    } catch (error) {
        console.error(error.message);
        next(error);  // Pass the error to the error-handling middleware
    }
};

// Get healer by ID
const getHealerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const healer = await poolDB.query('SELECT * FROM bayavasfdc.teacher__c WHERE id = $1 AND "type__c" = $2', [id, 'Parampara Healer']);

        if (healer.rows.length === 0) {
            return res.status(404).json({ message: 'Healer not found' });
        }
        res.status(200).json(healer);  // Send the single row as an object
    } catch (error) {
        console.error(error.message);
        next(error);  // Pass the error to the error-handling middleware
    }
};

module.exports = { getHealers, getHealerById };
