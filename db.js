const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: null,
  database: "csvtojson",
  port: 5432,
});

module.exports = { pool };
