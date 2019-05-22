const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');
const routes = require('./routes');
//let fs = require('fs');
let PDFParser = require('pdf2json');
const request = require('request');

mongoose.connection
  .on('error', error => console.log(error))
  .on('close', () => console.log('Database connection closed.'))
  .once('open', () => {
    let info = mongoose.connections;
    if (info)
      console.log(
        `Connected to MongoDB\nhost: ${info[0].host}\nport: ${
          info[0].port
        }\nuser: ${info[0].user}\n`
      );
  });

mongoose.connect(config.MONGO_URL, { useNewUrlParser: true });

const app = express();
app.listen(config.PORT, () =>
  console.log(
    `\n-----------------------------------------------------\nExample app listening on port ${
      config.PORT
    }!\n`
  )
);

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(bodyParser.json()); // for parsing application/json
app.use('/management', routes.management);
app.use('/api', routes.api);

module.exports = app;
