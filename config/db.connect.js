const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool
  .query("SELECT NOW()")
  .then((res) => console.log("DATABASE CONNECTED"))
  .catch((err) => console.error("DATABASE CONNECTION ERROR"));

module.exports = pool;
