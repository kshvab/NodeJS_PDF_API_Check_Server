//const connectToDatabase = require('../../db');
//const Rule = require('../../models/rule');
const services = require('../../services');

module.exports.handler = (event, context, callback) => {
  let ruleParamObj = JSON.parse(event.body);

  Promise.all([
    services.fullTextParsing.fParseFullText(ruleParamObj.pdfUrl),
    services.oneRuleParsing.fRuleParsingModule(
      ruleParamObj.rule,
      ruleParamObj.pdfUrl
    )
  ])
    .then(function(values) {
      let fullText = values[0];
      let targetValue = values[1];
      //console.log('fullText ' + fullText);
      //console.log('targetValue ' + targetValue);

      let respObj = {
        fullText,
        targetValue
      };
      const response = {
        statusCode: 200,
        body: JSON.stringify(respObj)
      };
      callback(null, response);
    })
    .catch(err =>
      callback(null, {
        statusCode: err.statusCode || 500,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Could not parse the file.'
      })
    );
};
