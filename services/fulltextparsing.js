const crawler = require('crawler-request');

function fParseFullText(PDFURL) {
  return new Promise(function(resolve, reject) {
    crawler(PDFURL).then(function(response) {
      resolve(response.text);
      return response.text;
    });
  });
}

module.exports = {
  fParseFullText
};
