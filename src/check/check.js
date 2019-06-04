const connectToDatabase = require('../../db');
const Rule = require('../../models/rule');
const services = require('../../services');

module.exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let checkingDataObj = JSON.parse(event.body);

  let errorsArr = [];

  let fieldsArr = checkingDataObj.fieldsArr;

  let counter = 0;

  connectToDatabase().then(() => {
    for (let i = 0; i < fieldsArr.length; i++) {
      Rule.find({ targetName: fieldsArr[i].targetName })
        .then(rule => {
          if (!rule.length) {
            errorsArr.push({
              fieldName: fieldsArr[i].targetName,
              errorDescription: 'Such parsing rule in DB does not exist'
            });
            counter++;
            if (counter == fieldsArr.length) fShowRes(errorsArr);
          } else {
            rule = rule[0];

            services.oneRuleParsing
              .fRuleParsingModule(rule, checkingDataObj.pdfUrl)
              .then(value => {
                if (fieldsArr[i].targetValue != value) {
                  errorsArr.push({
                    fieldName: fieldsArr[i].targetName,
                    errorDescription: 'Field values do not match'
                  });
                }
                counter++;
                if (counter == fieldsArr.length) fShowRes(errorsArr);
              });
          }
        })
        .catch(err =>
          callback(null, {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Could not fetch the rule.'
          })
        );
    }
  });

  function fShowRes(errorsArr) {
    let isPDFok = true;
    let bodyObj;
    if (errorsArr.length) {
      isPDFok = false;
      bodyObj = {
        isPDFok,
        errorsArr
      };
    } else {
      bodyObj = {
        isPDFok
      };
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify(bodyObj)
    };
    callback(null, response);
  }
};
