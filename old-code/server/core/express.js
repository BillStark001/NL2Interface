const express = require('express')
const webpack = require('webpack')
const bodyParser = require('body-parser')

const config = require('../config')

const app = express()

// Defaults
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

// public folder
app.use('/public', express.static('static'))

// API
const router = require('../routes')

app.use('/api', router)

app.use(require('connect-history-api-fallback')({
  index: '/index.html',
  rewrites: [
  ],
  verbose: false
}))

// Hot middleware
if (config.isDevMode()) {
  const compiler = webpack(config.webpackConfig)

  app.use(require('webpack-dev-middleware')(compiler, {
    stats: {
      colors: true
    }
  }))
  app.use(require('webpack-hot-middleware')(compiler))
} else {
  app.use(express.static('dist'))
}

module.exports = app
