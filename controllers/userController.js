const pool = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
SELECT 
u.id,
u.first_name,
u.last_name,
u.display_name,
u.phone_number,
u.email,
u.user_type,
u.is_active,
u.created_at,

jsonb_agg(
    DISTINCT jsonb_build_object(
    'id', da.id,
    'address', da.address,
    'latitude', da.latitude,
    'longitude', da.longitude,
    'is_default', da.is_default
    )
) FILTER (WHERE da.id IS NOT NULL) AS addresses,
  -- ORDERS
  jsonb_agg(
    DISTINCT jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'status', o.status,
      'payment_status', o.payment_status,
      'total_amount', o.total_amount,
      'created_at', o.created_at,

       -- ITEMS INSIDE EACH ORDER
      'items',COALESCE ((
        SELECT jsonb_agg(
          jsonb_build_object(
            'item_name', mi.name,
            'quantity', oi.quantity,
            'price', oi.unit_price,
            'total', oi.total_price
          )
    )
           FROM order_items oi
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        WHERE oi.order_id = o.id
      ),'[]'::jsonb))
  ) FILTER (WHERE o.id IS NOT NULL) AS orders,
-- LATEST ADDRESS (for table)
  (
    SELECT da2.address
    FROM delivery_addresses da2
    WHERE da2.user_id = u.id
    ORDER BY da2.created_at DESC
    LIMIT 1
  ) AS latest_address

FROM users u
LEFT JOIN delivery_addresses da ON da.user_id = u.id
LEFT JOIN orders o ON o.customer_id = u.id
WHERE u.deleted_at IS NULL
GROUP BY u.id
ORDER BY u.created_at DESC;
    `);

    res.json({
      success: true,
      users: result.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAllUsers };