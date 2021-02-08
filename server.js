require('dotenv').config()
const express = require('express');
const Sentry = require('@sentry/node');

const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const cors = require('cors');
process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;


Sentry.init({ dsn: 'https://821ed25647bf428fa880f896b028cde9@o332270.ingest.sentry.io/5206722' });
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use(Sentry.Handlers.requestHandler());

const passport = require('passport');
const bodyParser = require('body-parser');
app.use(cors());

//Error Handler
const createError = require('http-errors');
global.sendError = createError;

app.use(function(req, res, next){
  res.io = io;
  next();
});
//Request parser config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json'}));

//Passport config
app.use(passport.initialize());
require('./config/config.passport')(passport);

//Routes config
require('./app/routes/routes.index.js')(app);
require('./app/routes/routes.chat.js')(app);

// error handler
app.use(Sentry.Handlers.errorHandler());

app.use(function(req, res, next) {
  next(createError(404,"Route unavailable"));
});

require('./app/services/socket/socket_io')(io);


// app.use(function onError(err, req, res, next) {
//   // The error id is attached to `res.sentry` to be returned
//   // and optionally displayed to the user for support.
//   res.statusCode = 500;
//   res.end(res.sentry + "\n");
// });
app.use(function(err, req, res, next) {
  //Send Error
  // console.log(err)
  res.status(err.status || 500).send({status:"fail", message:err.message});
});


module.exports = {app: app, server: server};

