const express =require("express");
const router = express.Router();
const {getKitchenOrders} = require("../controllers/kitchenController.js");


router.get("/orders", getKitchenOrders);
module.exports = router;