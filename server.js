'use strict';

// Module imports
var express = require('express')
  , http = require('http')
  , bodyParser = require('body-parser')
  , util = require('util')
  , log = require('npmlog-ts')
  , cors = require('cors')
  , creditcard = require('creditcard')
;

const PROCESS = "PROCESS";

log.stream = process.stdout;
log.timestamp = true;
log.level = 'verbose';

// Instantiate classes & servers
var app    = express()
  , router = express.Router()
  , server = http.createServer(app)
;

// ************************************************************************
// Main code STARTS HERE !!
// ************************************************************************

// Main handlers registration - BEGIN
// Main error handler
process.on('uncaughtException', function (err) {
  log.error("","Uncaught Exception: " + err);
  log.error("","Uncaught Exception: " + err.stack);
});
// Detect CTRL-C
process.on('SIGINT', function() {
  log.error("","Caught interrupt signal");
  log.error("","Exiting gracefully");
  process.exit(2);
});
// Main handlers registration - END

// REST engine initial setup
const PORT    = 9100
    , URI     = '/cc'
    , CONTEXT = '/validate'
;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// REST stuff - BEGIN
router.post(CONTEXT, function(req, res) {
  if (!req.body || !req.body.creditcard) {
    log.error(PROCESS, "Invalid incoming body: %j", req.body);
    res.status(200).send({ valid: false});
    return;
  }
  log.verbose(PROCESS, "CC validation requested: %j", req.body);
  res.status(200).send({ valid: creditcard.validate(req.body.creditcard) });
});

app.use(URI, router);
// REST stuff - END

server.listen(PORT, () => {
  log.info(PROCESS,"Listening for any '%s' request at http://localhost:%s%s", "POST", PORT, URI + CONTEXT);
});
