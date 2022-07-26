const Sequelize = require('sequelize');
const logger = require('./logger');
const config = require('../config');

const sequelize = new Sequelize(config.DATABASE_URI); // config.DATABASE_URI is not defined

sequelize
  .authenticate()
  .then(() => {
    logger.info('Successfully established connection to database');
  })
  .catch((err) => {
    logger.error('Unable to connect to database', err);
  });

module.exports = sequelize;
