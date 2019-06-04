const connectToDatabase = require('../../db');
const Rule = require('../../models/rule');

module.exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Rule.find()
      .then(rules =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(rules)
        })
      )
      .catch(err =>
        callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the rules.'
        })
      );
  });
};
