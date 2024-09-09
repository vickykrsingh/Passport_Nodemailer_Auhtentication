const poolDB = require("../config/db");

const getTeachers = async (req, res) => {
    try {
        const teachers = await poolDB.query("SELECT * FROM bayavasfdc.teacher__c");
        res.status(200).json(teachers);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await poolDB.query("SELECT * FROM bayavasfdc.teacher__c WHERE id = $1", [id]);
        res.status(200).json(teacher);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getTeachers, getTeacherById };
