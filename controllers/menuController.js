const pool = require("../config/db");

exports.getMenuItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        mi.id,
        mi.item_code,
        mi.name,
        mi.category_id,
        mi.description,
        mc.name AS category,
        mi.food_type,
        mi.preparation_time,
        mi.image_urls,
        mi.is_bestseller,
        mi.chef_note,
        mi.is_available,
        ip.price,
        mi.created_at
      FROM menu_items mi
      LEFT JOIN menu_categories mc 
        ON mi.category_id = mc.id
      LEFT JOIN item_portions ip ON ip.menu_item_id = mi.id
      ORDER BY mi.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateMenuItem = async (req, res) => {
  const { id, field, value } = req.body;

  try {
    const allowedFields = [
      "item_code",
      "name",
      "description",
      "preparation_time",
      "price",
      "food_type",
      "is_available",
      "is_bestseller"
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: "Invalid field" });
    }

    if (field === "price") {
      await pool.query(
        `UPDATE item_portions SET price = $1 WHERE menu_item_id = $2`,
        [value, id]
      );
    } else {
      await pool.query(
        `UPDATE menu_items SET ${field} = $1 WHERE id = $2`,
        [value, id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name 
      FROM menu_categories
      WHERE is_active = true
      ORDER BY display_order
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// exports.createMenuItem = async (req, res) => {
//   const {
//     name,
//     category_id,
//     food_type,
//     price,
//     description,
//     preparation_time,
//     is_available,
//     is_bestseller,
//     image_url,
//     spice_level,
//     chef_note,
//     calories,
//     ingredients,
//     portion,
//     nutritional_info,
//     allegrens,
//     tags,
//     is_recommended,
//     is_popular,
//     is_new,
//     available_in,
//     rating
//   } = req.body;

//   try {
//     // insert menu item
//     const result = await pool.query(
//       `INSERT INTO menu_items 
//       (name, category_id, food_type, description, preparation_time, is_available, is_bestseller, image_urls,spice_level,chef_note,calories,ingredients,portion,nutritional_info,allegrens,tags,is_recommended,is_popular,is_new,available_in,rating')
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//       RETURNING id`,
//       [
//         name,
//         category_id,
//         food_type,
//         description,
//         preparation_time,
//         is_available,
//         is_bestseller,
//         [image_url], // array
//         spice_level,
//         chef_note,
//         calories,
//         [ingredients],
//         portion,
//         nutritional_info,
//         [allegrens],
//         [tags],
//         is_recommended,
//         is_popular,
//         is_new,
//         [available_in],
//         rating

//       ]
//     );

//     const menuId = result.rows[0].id;

//     // insert price
//     await pool.query(
//       `INSERT INTO item_portions (menu_item_id, price)
//        VALUES ($1, $2)`,
//       [menuId, price]
//     );

//     res.json({ success: true });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
const parseArray = (val) =>
  val ? val.split(",").map((v) => v.trim()) : null;
const parseJSON = (val) =>
  val
    ? JSON.stringify(val.split(",").map((v) => v.trim()))
    : null;
    

const buildPortions = (price) => {
  return JSON.stringify({
    regular: Number(price)
  });
};
exports.createMenuItem = async (req, res) => {
  const {
    name,
    category_id,
    food_type,
    price,
    description,
    preparation_time,
    is_available,
    is_bestseller,
    image_url,
    spice_level,
    chef_note,
    calories,
    ingredients,
    portions,
    nutritional_info,
    allergens,
    tags,
    is_recommended,
    is_popular,
    is_new,
    available_in,
    rating
  } = req.body;

  try {
    const codeResult = await pool.query(`
  SELECT COUNT(*) FROM menu_items
`);

const count = Number(codeResult.rows[0].count) + 1;
const safePrepTime =
  preparation_time && preparation_time >= 1
    ? preparation_time
    : 10;
const item_code = `ITEM-${String(count).padStart(3, "0")}`;
    const result = await pool.query(
      `INSERT INTO menu_items (
      branch_id,
        item_code,
        name,
        category_id,
        food_type,
        description,
        preparation_time,
        is_available,
        is_bestseller,
        image_urls,
        spice_level,
        chef_note,
        calories,
        ingredients,
        portions,
        nutritional_info,
        allergens,
        tags,
        is_recommended,
        is_popular,
        is_new,
        available_in,
        rating
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23
      )
      RETURNING id`,
//       [
//         "0bd6f52f-ea69-4e9e-9b96-205421495c52",
//         item_code,
//         name,
//         category_id,
//         food_type,
//         description,
//         safePrepTime,
//         // is_available,
//         // is_bestseller,
//         is_available ?? true,
// is_bestseller ?? false,
//         [image_url || ""],
//         spice_level || null,
//         chef_note || null,
//         calories || null,
//         ingredients ? parseArray(ingredients) : [],
//         portions ? buildPortions(price) : [],
//         parseJSON(nutritional_info) || null,
//         allergens ? parseArray(allergens) : [],
//         tags ? parseArray(tags) : [],
//         is_recommended || false,
//         is_popular || false,
//         is_new || false,
//         available_in ? parseArray(available_in) : [],
//         rating || null
//       ]
[
  "0bd6f52f-ea69-4e9e-9b96-205421495c52",
  item_code,
  name,
  category_id,
  food_type,
  description,
  safePrepTime,
  is_available ?? true,
  is_bestseller ?? false,
  image_url ? [image_url] : [],
  spice_level || "medium",
  chef_note || null,
  calories || null,
  ingredients ? parseArray(ingredients) : [],
  buildPortions(price),                  // ✅ ALWAYS
  parseJSON(nutritional_info),           // ✅ FIXED
  allergens ? parseArray(allergens) : [],
  tags ? parseArray(tags) : [],
  is_recommended || false,
  is_popular || false,
  is_new || false,
  available_in ? parseArray(available_in) : [],
  rating || 0
]
    );

    const menuId = result.rows[0].id;

    // await pool.query(
    //   `INSERT INTO item_portions (menu_item_id, price)
    //    VALUES ($1, $2)`,
    //   [menuId, price]
    // );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSingleMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT mi.*, ip.price
      FROM menu_items mi
      LEFT JOIN item_portions ip 
      ON ip.menu_item_id = mi.id
      WHERE mi.id = $1
    `, [id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateFullMenuItem = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category_id,
    food_type,
    price,
    description,
    preparation_time,
    is_available,
    is_bestseller,
    image_url
  } = req.body;

  try {
    await pool.query(`
      UPDATE menu_items SET
        name = $1,
        category_id = $2,
        food_type = $3,
        description = $4,
        preparation_time = $5,
        is_available = $6,
        is_bestseller = $7,
        image_urls = $8
      WHERE id = $9
    `, [
      name,
      category_id,
      food_type,
      description,
      preparation_time,
      is_available,
      is_bestseller,
      image_url ? [image_url] : [],
      id
    ]);

    await pool.query(`
      UPDATE item_portions
      SET price = $1
      WHERE menu_item_id = $2
    `, [price, id]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};