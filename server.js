const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const orderRoutes = require("./routes/orderRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes.js");
const userRoutes = require("./routes/userRoutes");
const statsRoutes = require("./routes/statsRoutes.js");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/kitchen", require("./routes/kitchenRoutes.js"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/stats", statsRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
})