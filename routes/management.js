const express = require('express');
const router = express.Router();
const apikey = require('../models/apikey');
const uuidv1 = require('uuid/v1');

router.get('/givemeapikey', function(req, res) {
  if (req.headers['authorization'] == 'revolgy') {
    createNewUser();
  } else res.status(401).send('Access denied,\na valid administrator Header is Required!');

  function createNewUser() {
    let generatedApiKey = uuidv1();
    console.log(generatedApiKey);

    let newApiKey = new apikey({ key: generatedApiKey });
    newApiKey.save(function(err) {
      if (err) {
        console.log('I can not save new Api Key to DB :(');
        return err;
      }
      res.send('New API-key generated: ' + generatedApiKey);
    });
  }
});
module.exports = router;
