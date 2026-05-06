const pool = require("../config/db");

// const getBestSellerItems = async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         id,
//         name,
//         image_urls,
//         is_bestseller

//       FROM menu_items
//       WHERE is_bestseller = true
//         AND is_available = true
//       LIMIT 10
//     `);

//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
const getBestSellerItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id,
        m.name,
        m.image_urls,
        m.is_bestseller,
        MIN(p.price) as price
      FROM menu_items m
      LEFT JOIN item_portions p 
        ON p.menu_item_id = m.id
      WHERE m.is_bestseller = true
        AND m.is_available = true
      GROUP BY m.id
      LIMIT 10
    `);

    const formatted = result.rows.map(item => ({
      name: item.name,
      price: item.price || 0,
      image: item.image_urls,
      orders: Math.floor(Math.random() * 100) // replace later
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = {
  getBestSellerItems
};