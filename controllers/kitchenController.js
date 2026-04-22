const pool = require("../config/db");

exports.getKitchenOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id as id,
        o.order_number as order_number,
        o.created_at,
        o.status,
        json_agg(
          json_build_object(
            'name', oi.item_name,
            'qty', oi.quantity
          )
        ) as items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};