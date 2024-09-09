const express = require("express");
const { getHealers, getHealerById } = require("../controllers/healerController");

const router = express.Router();

router.get("/", getHealers);
router.get("/:id", getHealerById);

module.exports = router;
