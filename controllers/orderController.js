const pool = require("../config/db");
const VALID_STATUSES = [
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
  "rejected"
];

// allowed transitions (production safe)
const STATUS_FLOW = {
  confirmed: ["preparing", "cancelled", "rejected"],
  preparing: ["ready", "cancelled"],
  ready: ["served"],
  served: ["completed"],
  completed: [],
  cancelled: [],
  rejected: [],
};
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
        o.id AS id,
        o.order_number AS order_number,

        COALESCE(u.display_name, u.first_name) AS name,
        u.phone_number AS phone_number,

        CASE 
          WHEN o.order_type = 'takeaway' THEN 'Takeaway'
          ELSE da.address
        END AS address,

        o.status,
        o.payment_status,
        o.total_amount,

        u.phone_number AS delivery_contact,

        STRING_AGG(oi.item_name, ', ') AS items

      FROM orders o

      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
      LEFT JOIN order_items oi ON oi.order_id = o.id

      GROUP BY 
        o.id, u.display_name, u.first_name, u.phone_number,o.order_number,o.payment_status,
        da.address, o.status, o.total_amount, o.order_type

      ORDER BY o.created_at DESC;
    `);

    res.json(result.rows);
    console.log("ORDERS RESULT:", result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.updateOrderStatus = async (req, res) => {
  const { orderId, newStatus } = req.body;

  try {
    // 1️⃣ Check valid status
    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    // 2️⃣ Get current status
    const currentResult = await pool.query(
      "SELECT status FROM orders WHERE id = $1",
      [orderId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const currentStatus = currentResult.rows[0].status;

    // 3️⃣ Check allowed transition
    const allowedNext = STATUS_FLOW[currentStatus] || [];

    if (!allowedNext.includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot change from ${currentStatus} to ${newStatus}`,
      });
    }

    // 4️⃣ Update query (with timestamps)
    let query = `
      UPDATE orders 
      SET status = $1
    `;
    let values = [newStatus];

    // optional timestamps
    if (newStatus === "preparing") {
      query += `, preparing_at = NOW()`;
    }
    if (newStatus === "ready") {
      query += `, ready_at = NOW()`;
    }
    if (newStatus === "served") {
      query += `, served_at = NOW()`;
    }
    if (newStatus === "completed") {
      query += `, completed_at = NOW()`;
    }

    query += ` WHERE id = $2`;
    values.push(orderId);

    await pool.query(query, values);

    res.json({
      success: true,
      message: "Status updated successfully",
    });

  } catch (err) {
    console.error(err);
      console.error("STATUS ERROR:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};