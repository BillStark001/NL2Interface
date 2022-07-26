/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); // only allow communication in a specific port in local machine
const config = require('../config');

const app = express();

if (config.isDevMode()) {
  // enable localhost CORS for dev
  app.use(
    cors({
      origin: ['http://localhost:3000', 'https://localhost:3000'],
      methods: ['POST', 'GET'],
    })
  );
}

// Defaults
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// public folder
app.use('/public', express.static('static'));

// API
const router = require('../routes');

app.use('/api', router);

app.use(
  require('connect-history-api-fallback')({
    index: '/index.html',
    rewrites: [],
    verbose: false,
  })
);

// Hot middleware
if (config.isDevMode()) {
  console.log('when in the dev mode, the hot-reloading is already integrated.');
} else {
  try {
    if (fs.existsSync('build')) {
      console.log('Start to serve the build folder.');
      app.use(express.static('build'));
    } else {
      console.log(
        'build folder does not exist. Please run "npm run client-build" first to generate' +
          'the build folder and try again.'
      );
    }
  } catch (e) {
    console.log('An error occurred.');
  }
}

module.exports = app;
