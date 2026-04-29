const express = require("express");
const router = express.Router();

const { getMenuItems,updateMenuItem,getCategories,createMenuItem,updateFullMenuItem,getSingleMenuItem } = require("../controllers/menuController");

router.get("/items", getMenuItems);
router.put("/update", updateMenuItem);
router.get("/categories", getCategories);
router.post("/create", createMenuItem);
router.put("/update-full/:id", updateFullMenuItem);
router.get("/item/:id", getSingleMenuItem);
module.exports = router;