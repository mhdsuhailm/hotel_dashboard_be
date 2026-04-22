const express = require('express');

const router = express.Router();
const {getOrders} = require("../controllers/orderController.js");
const { updateOrderStatus } = require("../controllers/orderController.js");

router.get("/orders", getOrders);
router.put("/status", updateOrderStatus);

module.exports = router;