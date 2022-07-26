/* eslint-disable no-plusplus */
const fetch = require('node-fetch');
const path = require('path');

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const logger = require('../core/logger');
const dbPool = require('../database/postgres');
const spiderTablesMeta = require('../database/tables');
const { MODEL_URL } = require('../config');

const VERSION_PREFIX = '/legacy';

const getSpiderTables = () => {
  const res = {};
  Object.keys(spiderTablesMeta).forEach((id) => {
    const db = spiderTablesMeta[id];
    const tables = db.table_names_original;
    res[db.db_id] = {
      tables,
    };
  });
  return res;
};
const spiderTables = getSpiderTables();

const getDemoTables = async () => {
  return dbPool.query('SELECT * FROM demo_tables');
};

module.exports = (router) => {
  router.route(`${VERSION_PREFIX}/database/list`).get(async (req, res) => {
    const response = {};
    response.databases = {};
    Object.keys(spiderTables).forEach((dbKey) => {
      response.databases[dbKey] = spiderTables[dbKey].tables;
    });
    res.json(response);
  });

  router.route(`/demoDatabase`).get(async (req, res) => {
    res.json(getDemoTables());
  });

  router.route(`${VERSION_PREFIX}/database/get/:dbId`).get(async (req, res) => {
    try {
      const name = req.params.dbId;
      const dbPath = `../database/database/${name}/${name}.sqlite`;
      logger.info(`Attempting to open DB from path ${dbPath}`);
      const db = await sqlite.open({
        filename: path.resolve(__dirname, dbPath),
        driver: sqlite3.Database,
      });

      const results = {};
      let number = 0;
      Object.keys(spiderTables[name].tables).forEach(async (id) => {
        const tableName = spiderTables[name].tables[id];
        const sql = `SELECT * FROM ${tableName}`;
        logger.info(`Executing sql ${sql}`);
        const result = await db.all(sql);
        results[tableName] = result;
        number++;
        if (number === Object.keys(spiderTables[name].tables).length) {
          console.log('result db', results);
          res.json(results);
        }
      });
    } catch (err) {
      logger.error(`Read failed due to error ${err}`);
      res.sendStatus(500);
    }
  });

  router.route('/query').post(async (req, res) => {
    const data = await fetch(`${MODEL_URL}/predict`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const response = await data.json();
    res.json(response);
  });
};
