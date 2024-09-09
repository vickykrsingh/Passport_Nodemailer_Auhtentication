const express = require("express");
const { getTeachers, getTeacherById } = require("../controllers/teacherController");

const router = express.Router();

router.get("/", getTeachers);
router.get("/:id", getTeacherById);

module.exports = router;
