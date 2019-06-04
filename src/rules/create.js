const connectToDatabase = require('../../db');
const Rule = require('../../models/rule');

module.exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let ruleParamObj = JSON.parse(event.body);
  connectToDatabase().then(() => {
    var new_rule = new Rule(ruleParamObj);
    new_rule
      .save()
      .then(rule =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(rule)
        })
      )
      .catch(err =>
        callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not create the rule.'
        })
      );
  });
};
