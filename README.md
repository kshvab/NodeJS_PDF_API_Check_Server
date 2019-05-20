# PDF API Validation

This project is for API endpoint to validate PDF content of generated documents 
from external *HTML to PDF* services, like [Docraptor](Docraptor.com) or [Api2pdf](Api2pdf.com)

## Problem definition

*  for certain actions, we use external services for generation od PDF files (mostly invoices)
*  Time to time, the services fail and return invalid content in PDF, which we then send to customers
*  We need to build an API service, which would validate PDF content before sendind the PDF to customers


## Suggested behaviour of the API

Request payload: 
* JSON data to be validated in PDF
* URL to generated PDF file ([example](Examples/demo_invoice.pdf))

Response:
* parametr if content is valid
* parametr what content is invalid

## Next steps

* propose API design, including request/response JSON object (in OpenAPI Spec format)
* build API backend (lambda/microservice), with API key authentication (can be used: Node.js library [crawler-request](https://www.npmjs.com/package/crawler-request))

