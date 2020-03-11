/* eslint-disable no-console */
const express = require('express')

const app = express()
app.use(express.static('docs'))

let port = process.env.PORT || 4000

var listener = app.listen(port, function () {
  console.log('listening on port ' + listener.address().port);
  console.log('http://localhost:' + listener.address().port);
});
