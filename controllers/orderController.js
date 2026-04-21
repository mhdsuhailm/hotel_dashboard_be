const pool = require("../config/db");

// exports.getOrders = async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         o.id AS order_id,
//         u.display_name AS customer_name,
//         u.phone_number,
//         da.address,
//         o.status,
//         o.total_amount,
//         u.phone_number AS delivery_contact,
//         STRING_AGG(oi.item_name,', ') AS items
//       FROM orders o
//       LEFT JOIN users u ON o.customer_id = u.id
//       LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
//       LEFT JOIN order_items oi ON oi.order_id = o.id
//       GROUP BY 
//         o.id, u.display_name, u.phone_number, da.address, o.status, o.total_amount
//       ORDER BY o.created_at DESC;
//     `);

//     res.json(result.rows);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
exports.getOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id AS order_id,

        COALESCE(u.display_name, u.first_name) AS name,
        u.phone_number AS phone_number,

        CASE 
          WHEN o.order_type = 'takeaway' THEN 'Takeaway'
          ELSE da.address
        END AS address,

        o.status,
        o.total_amount,

        u.phone_number AS delivery_contact,

        STRING_AGG(oi.item_name, ', ') AS items

      FROM orders o

      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
      LEFT JOIN order_items oi ON oi.order_id = o.id

      GROUP BY 
        o.id, u.display_name, u.first_name, u.phone_number,
        da.address, o.status, o.total_amount, o.order_type

      ORDER BY o.created_at DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};