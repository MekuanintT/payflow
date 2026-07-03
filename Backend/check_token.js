const pool = require('./config/db.js');

(async () => {
    try {
        const res = await pool.query(
            "SELECT email, reset_token, reset_token_expires FROM users WHERE email = $1",
            ['admin@payflow.com']
        );
        console.log(res.rows);
    } catch (err) {
        console.error('Query failed:', err.message);
    } finally {
        await pool.end();
    }
})();
