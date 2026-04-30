// // controllers/userController.js
// const pool = require("../config/db");

// const getAllUsers = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT id, phone_number, email, first_name, last_name, display_name, user_type, is_active, created_at 
//        FROM users 
//        WHERE deleted_at IS NULL 
//        ORDER BY created_at DESC`
//     );

//     res.json({
//       success: true,
//       users: result.rows,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// module.exports = { getAllUsers };
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

json_agg(
    json_build_object(
    'id', da.id,
    'address', da.address,
    'latitude', da.latitude,
    'longitude', da.longitude,
    'is_default', da.is_default
    )
) FILTER (WHERE da.id IS NOT NULL) AS addresses,

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