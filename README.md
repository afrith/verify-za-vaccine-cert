# verify-za-vaccine-cert

![npm](https://img.shields.io/npm/v/verify-za-vaccine-cert)

This is a TypeScript/JavaScript library which verifies the QR codes of
certificates issued by the [South African COVID-19 Vaccine Certificate
System](https://vaccine.certificate.health.gov.za/). It is an implementation of
the algorithm described in the [VCS Verification API Specification, Version
1.0](https://sacoronavirus.b-cdn.net/wp-content/uploads/2021/12/Vaccine-Certificate-System-Verification-API-Specification-002.pdf).

The current vaccine certificates do not incorporate a digital signature.
They can only be verified by calling the Public VCS Verification API
provided by the Department of Health.
It is therefore not possible to validate certificates when offline.
For offline use this library does provide a function that checks the format of
a certificate without validating it through the API,
but this will not detect sophisticated forgeries.

This library works in both Node.js and in the browser. However, the VCS API
currently does not set the necessary CORS headers, so you can't call it
directly from browser code. You will have to proxy the requests through your
own server, for which see the `endpointUrl` option described below.

Note that the verification API specification indicates that it has is a limit
of 30 requests per IP address per second.

## Install

```sh
npm install --save verify-za-vaccine-cert
```

## Example

```js
import { verifyCert, VerificationError } from 'verify-za-vaccine-cert'

const qrcode = '{"alg":"sha256","kid":"9e9e5863-b900-4f2f-b572-c48ee4ddee75cwtG6ZL54We1MmE","iss":"ZAF","iat":"2021-12-03T18:55:37.790","exp":"3M","hcert":"eyJ2ZXJzaW9uIjoiMi4wIiwiaWRUeXBlIjoiUlNBSUQiLCJpZE1hc2siOiI4ODAyMTAqKioqKio2IiwiZmlyc3ROYW1lIjoiQWRyaWFuIEpvaG4iLCJzdXJuYW1lIjoiRnJpdGgiLCJkYXRlT2ZCaXJ0aCI6IjEwLUZlYi0xOTg4IiwiaW1tdW5pemF0aW9uRXZlbnRzIjpbeyJ2YWNjaW5lUmVjZWl2ZWQiOiJDb21pcm5hdHkiLCJ2YWNjaW5lRGF0ZSI6IjIwLUF1Zy0yMDIxIn0seyJ2YWNjaW5lUmVjZWl2ZWQiOiJDb21pcm5hdHkiLCJ2YWNjaW5lRGF0ZSI6IjA0LU9jdC0yMDIxIn1dLCJleHBpcnlEYXRlIjoiMDMtTWFyLTIwMjIifQ==","hashalg":"sha256","hash":"caed4092ce4cd4af205aa90653126b836ea94e2d2619fe7fb53ea71af24c11fa"}'

const result = await verifyCert(qrcode)

if (result.valid) {
  console.log('Valid cert:', JSON.stringify(result.cert))
} else {
  console.log('Invalid cert:', VerificationError[result.reason])
}
```

The value of `result.cert` in this case is:
```json
{
  "version": "2.0",
  "idType": "RSAID",
  "idMask": "880210******6",
  "firstName": "Adrian John",
  "surname": "Frith",
  "dateOfBirth": "10-Feb-1988",
  "immunizationEvents": [
    {
      "vaccineReceived": "Comirnaty",
      "vaccineDate": "20-Aug-2021"
    },
    {
      "vaccineReceived": "Comirnaty",
      "vaccineDate": "04-Oct-2021"
    }
  ],
  "expiryDate": "03-Mar-2022"
}
```

## Usage

### Verify a certificate (online)
```js
const result = await verifyCert(qrcode, { endpointUrl: '...' })
```
The parameter `qrcode` must be a string containing the data as scanned
from the QR code on the certificate. If `endpointUrl` is set then the
verification request will be sent to that URL instead of the public VCS
endpoint.

If the certificate is valid the result will have the form:
```js
{
  valid: true,
  cert: { ... }
}
```
and `cert` will contain the data stored in the certificate (see the example
above).

If the certificate is invalid the result will have the form:
```js
{
  valid: false,
  reason: ...
}
```
The `reason` field will be one of the values from `VerificationError` (which is
a TypeScript `enum`):
* `InvalidJson`: the value supplied does not parse as a JSON object.
* `MissingField`: one of the required fields is missing from the certificate.
* `InvalidHash`: the certificate's hash is not valid.
* `CertFormat`: the inner certificate data is not a Base64-encoded JSON object
as required.
* `ApiBadResponse`: the request to the VCS API failed.
* `ApiBadJson`: the response from the VCS API was not valid JSON.
* `ApiNotValid`: the VCS API responded that the certificate is not valid.

### Check certificate format without verification (offline)
```js
const result = checkCertFormat(qrcode)
```
The result of this function takes the same format as that of `verifyCert`,
except that it is returned synchronously and not through a Promise.

## License
This library is released under the MIT License. See `LICENSE` for more details.
Copyright © 2022 Adrian Frith.
