const express = require("express");
const { getCattle,getCattleById } = require("../controllers/cattleController");

const router = express.Router();

router.get("/get-cattle", getCattle);
router.get("/get-cattle/:id",getCattleById);

module.exports = router;
