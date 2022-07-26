/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
const dbPool = require('../database/postgres');
const logger = require('../core/logger');
const configFile = require('../config/config.json');

const ROW_LIMIT = configFile.maxDBRows;

let databaseList = {};
const getDatabaseList = async () => {
  if (Object.keys(databaseList).length === 0) {
    // only fetch once
    const recordNumber = await dbPool.query('SELECT * FROM demo_databases');
    const { rows } = recordNumber;
    const result = {};
    for (let rowID = 0; rowID < rows.length; rowID++) {
      const { name, tables } = rows[rowID];
      result[name.toLowerCase().trim()] = tables;
    }
    databaseList = result;
  }
  return databaseList;
};

module.exports = async (router) => {
  router.route(`/database/list`).get(async (req, res) => {
    const response = {};
    try {
      const dbList = await getDatabaseList();
      response.databases = dbList;
      response.success = true;
    } catch (error) {
      response.databases = [];
      response.success = false;
      response.message = 'database list';
      console.log('error in getting database list:', error.message);
    }
    res.json(response);
  });

  router.route(`/database/get/:dbId`).get(async (req, res) => {
    const dbName = req.params.dbId;
    const dbList = await getDatabaseList();
    console.log('dbList', dbList);
    const tableNamesInDB = dbList[dbName.toLowerCase().trim()];
    const results = {};
    let number = 0;
    tableNamesInDB.forEach(async (tableName) => {
      const tbName = `${dbName}_${tableName}`;
      const tableQuery = `SELECT * FROM ${tbName} LIMIT ${ROW_LIMIT}`;
      logger.info(`Executing sql ${tableQuery}`);
      const queryResults = await dbPool.query(tableQuery, []);
      const { rows } = queryResults;
      results[tableName] = rows;
      number++;
      if (number === tableNamesInDB.length) {
        res.json(results);
      }
    });
  });
};
