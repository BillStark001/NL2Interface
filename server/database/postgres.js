const { Pool } = require('pg');

const dbPool = new Pool({
  database: 'postgres',
  user: 'postgres',
  password: 'talk2data',
  host: 'database-1.cqy7yocvnpqc.us-east-1.rds.amazonaws.com',
  port: '5432',
});

module.exports = dbPool;
