// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const { getBestSellerItems } = require("../controllers/statsController.js");

router.get("/bestsellers", getBestSellerItems);

module.exports = router;