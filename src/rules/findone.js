const connectToDatabase = require('../../db');
const Rule = require('../../models/rule');

module.exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Rule.find({ targetName: event.pathParameters.targetName })
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
          body: 'Could not fetch the rule.'
        })
      );
  });
};
