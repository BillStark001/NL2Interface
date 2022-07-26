/* eslint-disable global-require */
const express = require('express');
const path = require('path');
const fs = require('fs');

const basename = path.basename(module.filename);
const router = express.Router();

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require
    require(`./${file}`)(router);
  });

module.exports = router;
