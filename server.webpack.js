const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.dev.js')

const app = express();
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

app.use(express.static('docs'));

var listener = app.listen(4000, function () {
  console.log("****************************************");
  console.log('**** http://localhost:' + listener.address().port + "/");
  console.log("****************************************");
  console.log("\n");
});
