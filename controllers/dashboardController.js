const pool = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    // TODAY RANGE
    const todayQuery = `
      SELECT 
        COUNT(*) AS total_orders,
        COUNT(DISTINCT customer_id) AS total_customers,
        SUM(total_amount) FILTER (WHERE payment_status = 'paid') AS total_income,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders
      FROM orders
      WHERE created_at >= CURRENT_DATE
        AND created_at < CURRENT_DATE + INTERVAL '1 day'
    `;

    const todayResult = await pool.query(todayQuery);
    const today = todayResult.rows[0];

    // YESTERDAY (for %)
    // const yesterdayQuery = `
    //   SELECT 
    //     SUM(total_amount) FILTER (WHERE payment_status = 'paid') AS total_income
    //   FROM orders
    //   WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
    //     AND created_at < CURRENT_DATE
    // `;
    const yesterdayQuery = `
        SELECT 
            COUNT(*) AS total_orders,
            COUNT(DISTINCT customer_id) AS total_customers,
            COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
            SUM(total_amount) FILTER (WHERE payment_status = 'paid') AS total_income
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
            AND created_at < CURRENT_DATE
        `;

    // const yResult = await pool.query(yesterdayQuery);
    // const yesterdayIncome = yResult.rows[0].total_income || 0;
    const yResult = await pool.query(yesterdayQuery);
    const yesterday = yResult.rows[0];

    const yesterdayIncome = yesterday.total_income || 0;
    const todayIncome = today.total_income || 0;

    // % CHANGE
    const incomeChange = yesterdayIncome
      ? ((todayIncome - yesterdayIncome) / yesterdayIncome) * 100
      : 0;

    const calcChange = (today, yesterday) => {
        return yesterday ? ((today - yesterday) / yesterday) * 100 : 0;
    };

    const orderChange = calcChange(today.total_orders, yesterday.total_orders);
    const customerChange = calcChange(today.total_customers, yesterday.total_customers);
    const cancelChange = calcChange(today.cancelled_orders, yesterday.cancelled_orders);

    const range = req.query.range || "1Y";

    let interval = "7 days";
    let groupBy = "DATE(created_at)";

    if (range === "1M") {
    interval = "30 days";
    } else if (range === "1Y") {
    interval = "1 year";
    groupBy = "DATE_TRUNC('month', created_at)";
    }

    const chartQuery = `
    SELECT 
        ${groupBy} AS date,
        SUM(total_amount) AS total
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
    GROUP BY ${groupBy}
    ORDER BY date
    `;

    const chartResult = await pool.query(chartQuery);
    // FINAL RESPONSE
    res.json({
        income: Number(todayIncome),
        orders: Number(today.total_orders),
        customers: Number(today.total_customers),
        cancelled: Number(today.cancelled_orders),

        incomeChange: incomeChange.toFixed(1),
        orderChange: orderChange.toFixed(1),
        customerChange: customerChange.toFixed(1),
        cancelChange: cancelChange.toFixed(1),

        incomeTrend: chartResult.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};