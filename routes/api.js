const express = require('express');
const router = express.Router();
const apikey = require('../models/apikey');
let PDFParser = require('pdf2json');
const request = require('request');

router.get('/', (req, res) => {
  res.status(200).send('Welcome to the API\n(The PDF documents validation)');
});

router.get('/checkpdf', (req, res) => {
  const queryFieldsNameArr = [
    'provider',
    'customer',
    'total',
    'invoice',
    'currency',
    'pdf'
  ];

  apikey.findOne({ key: req.headers['authorization'] }, function(err, result) {
    if (err) {
      console.log('Problems with connecting to DB');
      res.status(500).send('Problems with connecting to DB');
    }
    if (result) checkQuery();
    else {
      res.status(401).send('Access denied, a valid API key is Required!');
    }
  });

  function checkQuery() {
    let queryIsOk = true;
    let queryErrorFields = [];

    for (let i = 0; i < queryFieldsNameArr.length; i++) {
      if (
        !req.query.hasOwnProperty(queryFieldsNameArr[i]) ||
        !req.query[queryFieldsNameArr[i]]
      ) {
        queryIsOk = false;
        queryErrorFields.push(queryFieldsNameArr[i]);
      }
    }

    if (!queryIsOk) fResBadQuery(queryErrorFields);
    else fCheckPDF();
  }

  function fResBadQuery(queryErrorFields) {
    let resJsonObj = {
      message: 'The request is not correct',
      errorFields: queryErrorFields
    };
    res.status(400).json(resJsonObj);
  }

  function fCheckPDF() {
    let pdfParser = new PDFParser(this, 1);
    let pdfUrl = req.query.pdf;

    let pdfPipe = request({ url: pdfUrl, encoding: null }).pipe(pdfParser);

    pdfParser.on('pdfParser_dataError', errData => {
      console.log('Errorf');
      console.error(errData.parserError);
    });

    pdfParser.on('pdfParser_dataReady', pdfData => {
      let PDFparsingResultStr = pdfParser.getRawTextContent();

      let providerVatId = fParseProviderVatId(PDFparsingResultStr);
      let customerBrandName = fParseCustomerBrandName(PDFparsingResultStr);
      let totalDue = fParseTotalDue(PDFparsingResultStr);
      let invoiceNumber = fParseInvoiceNumber(PDFparsingResultStr);
      let currency = fParseCurrency(PDFparsingResultStr);

      let pdfErrorFields = [];

      if (providerVatId != req.query.provider) pdfErrorFields.push('provider');
      if (customerBrandName != req.query.customer)
        pdfErrorFields.push('customer');
      if (totalDue != req.query.total) pdfErrorFields.push('total');
      if (invoiceNumber != req.query.invoice) pdfErrorFields.push('invoice');
      if (currency != req.query.currency) pdfErrorFields.push('currency');

      fResCheckResult(pdfErrorFields);

      //console.log(PDFparsingResultStr);
      /*
      console.log('---> providerVatId: ' + providerVatId);
      console.log('---> customerBrandName: ' + customerBrandName);
      console.log('---> totalDue: ' + totalDue);
      console.log('---> invoiceNumber: ' + invoiceNumber);
      console.log('---> currency: ' + currency);
      */
    });
  }

  function fResCheckResult(pdfErrorFields) {
    let resJsonObj;

    if (pdfErrorFields.length) {
      resJsonObj = {
        isPdfValid: false,
        errorFields: pdfErrorFields
      };
    } else {
      resJsonObj = {
        isPdfValid: true
      };
    }
    res.status(200).json(resJsonObj);
  }
});

//******** Temporary routes for generating references to samples of PDF invoices  ********/
router.get('/demo_invoice', function(req, res) {
  res.sendFile(__dirname + '/TEMP_static/demo_invoice.pdf');
});

router.get('/demo_invoice_invalid', function(req, res) {
  res.sendFile(__dirname + '/TEMP_static/demo_invoice_invalid.pdf');
});
//******** / Temporary routes for generating references to samples of PDF invoices  ********/
module.exports = router;

//******** Sub Functions Area ********/

function fParseProviderVatId(PDFparsingResultStr) {
  let strBeforProviderVatId = 'COMPANY ID: 25082159, VAT ID: ';
  let indexOfProviderVatId =
    PDFparsingResultStr.indexOf(strBeforProviderVatId) +
    strBeforProviderVatId.length;
  let providerVatId = PDFparsingResultStr.slice(
    indexOfProviderVatId,
    indexOfProviderVatId + 10
  );
  return providerVatId;
}

function fParseCustomerBrandName(PDFparsingResultStr) {
  let strBeforCustomerBrandName = 'INVOICE TO';
  let indexOfCustomerBrandName =
    PDFparsingResultStr.indexOf(strBeforCustomerBrandName) +
    strBeforCustomerBrandName.length;
  let strAfterCustomerBrandName = PDFparsingResultStr.slice(
    indexOfCustomerBrandName + 2
  );
  let customerBrandName = strAfterCustomerBrandName.slice(
    0,
    strAfterCustomerBrandName.indexOf('\n') - 1
  );
  return customerBrandName;
}

function fParseTotalDue(PDFparsingResultStr) {
  let strBeforTotalDue = 'TOTAL DUE';
  let indexOfTotalDue =
    PDFparsingResultStr.indexOf(strBeforTotalDue) + strBeforTotalDue.length;
  let strAfterTotalDue = PDFparsingResultStr.slice(indexOfTotalDue + 2);
  let totalDue = strAfterTotalDue.slice(0, strAfterTotalDue.indexOf('\n') - 1);
  if (totalDue[0] == '€') totalDue = totalDue.slice(1);
  if (totalDue[totalDue.length - 1] == 'č') totalDue = totalDue.slice(0, -2);
  totalDue = totalDue.replace(',', '.');
  totalDue = +totalDue; //typeof totalDue -number
  return totalDue;
}

function fParseInvoiceNumber(PDFparsingResultStr) {
  let strBeforInvoiceNumber = 'INVOICE #';
  let indexOfInvoiceNumber =
    PDFparsingResultStr.indexOf(strBeforInvoiceNumber) +
    strBeforInvoiceNumber.length;
  let strAfterInvoiceNumber = PDFparsingResultStr.slice(
    indexOfInvoiceNumber + 2
  );
  let invoiceNumber = strAfterInvoiceNumber.slice(
    0,
    strAfterInvoiceNumber.indexOf('\n') - 1
  );
  if (invoiceNumber.length != 8) invoiceNumber = '';
  return invoiceNumber;
}

function fParseCurrency(PDFparsingResultStr) {
  let strBeforCurrency = 'TOTAL DUE [';
  let indexOfCurrency =
    PDFparsingResultStr.indexOf(strBeforCurrency) + strBeforCurrency.length;
  let strAfterCurrency = PDFparsingResultStr.slice(indexOfCurrency);
  let currency = strAfterCurrency.slice(0, 3);
  //if (invoiceNumber.length != 8) invoiceNumber = '';
  return currency;
}
