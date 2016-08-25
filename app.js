//simple express app to serve up custom APIs

var express = require('express');
var bodyParser = require('body-parser');

var routes = require('./routes/index');



var app = express();

//allows CORS
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  next();
});

app.use(express.static('public'));
app.use(bodyParser.json());

app.use('/api', routes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;