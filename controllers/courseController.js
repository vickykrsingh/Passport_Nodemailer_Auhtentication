const poolDB = require("../config/db");

const getCourses = async (req, res) => {
    try {
        const courses = await poolDB.query("SELECT * FROM bayavasfdc.course__c");
        res.status(200).json(courses);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await poolDB.query("SELECT * FROM bayavasfdc.course__c WHERE id = $1", [id]);
        res.status(200).json(course);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getCourses, getCourseById };
