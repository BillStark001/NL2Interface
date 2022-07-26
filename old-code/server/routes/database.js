const fetch = require('node-fetch')
const fs = require('fs')
const logger = require('../core/logger')
const path = require('path')

const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')

const get_spider_tables = () => {
  const spider_tables = require('../database/tables')
  let res = {}
  for (id in spider_tables) {
    db = spider_tables[id]
    db_key = db['db_id']
    tables = db['table_names_original']
    res[db_key] = {
      tables
    }
  }
  return res
}
const spider_tables = get_spider_tables()

module.exports = function (router) {
  const MODEL_URL = require('../config').MODEL_URL;

  router.route('/database/list')
    .get(async (req, res) => {
      const response = {}
      response['databases'] ={}
      for (db_key in spider_tables) {
        response['databases'][db_key] = spider_tables[db_key]['tables']
      }
      res.json(response)
    })

  router.route('/database/get/:dbId')
    .get(async (req, res) => {
      try {
        const name = req.params['dbId']
        const db_path = '../database/database/' + name + '/' + name + '.sqlite'
        logger.info('Attempting to open DB from path ' + db_path)
        const db = await sqlite.open({
          filename: path.resolve(__dirname, db_path),
          driver: sqlite3.Database
        })

        results = {}
        for (id in spider_tables[name]['tables']) {
          const table_name = spider_tables[name]['tables'][id]
          const sql = "SELECT * FROM " + table_name
          logger.info('Executing sql ' + sql)
          const result = await db.all(sql)
          results[table_name] = result
        }
        res.json(results)
      } catch (err) {
        logger.error('Read failed due to error ' + err)
        res.sendStatus(500)
      }
    })

  router.route('/query')
    .post(async (req, res) => {
      const data = await fetch(MODEL_URL + '/predict', {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      })
      const response = await data.json()
      res.json(response)
    })
}