import { checkCertFormat } from './index'
import { strictEqual } from 'assert'

describe('checkCertFormat', () => {
  it("should return valid: false if certificate is not json", async () => {
    const invalid = `this is a string, not json`
    const result = checkCertFormat(invalid)
    strictEqual(result.valid, false)
  })

  it("should return valid: false if hash is incorrect", async () => {
    const invalid = `{"alg":"sha256","kid":"9e9e5863-b900-4f2f-b572-c48ee4ddee75cwtG6ZL54We1MmE","iss":"ZAF","iat":"2021-12-03T18:55:37.790","exp":"3M","hcert":"eyJ2ZXJzaW9uIjoiMi4wIiwiaWRUeXBlIjoiUlNBSUQiLCJpZE1hc2siOiI4ODAyMTAqKioqKio2IiwiZmlyc3ROYW1lIjoiQWRyaWFuIEpvaG4iLCJzdXJuYW1lIjoiRnJpdGgiLCJkYXRlT2ZCaXJ0aCI6IjEwLUZlYi0xOTg4IiwiaW1tdW5pemF0aW9uRXZlbnRzIjpbeyJ2YWNjaW5lUmVjZWl2ZWQiOiJDb21pcm5hdHkiLCJ2YWNjaW5lRGF0ZSI6IjIwLUF1Zy0yMDIxIn0seyJ2YWNjaW5lUmVjZWl2ZWQiOiJDb21pcm5hdHkiLCJ2YWNjaW5lRGF0ZSI6IjA0LU9jdC0yMDIxIn1dLCJleHBpcnlEYXRlIjoiMDMtTWFyLTIwMjIifQ==","hashalg":"sha256","hash":"12345678ce4cd4af205aa90653126b836ea94e2d2619fe7fb53ea71af24c11fa"}`
    const result = checkCertFormat(invalid)
    strictEqual(result.valid, false)
  })

  it("should return valid: false if a required key is missing", async () => {
    const invalid = `{"alg":"sha256","kid":"9e9e5863-b900-4f2f-b572-c48ee4ddee75cwtG6ZL54We1MmE","iss":"ZAF","exp":"3M","hcert":"eyJ2ZXJzaW9uIjoiMi4wIiwiaWRUeXBlIjoiUlNBSUQiLCJpZE1hc2siOiI4ODAyMTAqKioqKio2IiwiZmlyc3ROYW1lIjoiQWRyaWFuIEpvaG4iLCJzdXJuYW1lIjoiRnJpdGgiLCJkYXRlT2ZCaXJ0aCI6IjEwLUZlYi0xOTg4IiwiaW1tdW5pemF0aW9uRXZlbnRzIjpbeyJ2YWNjaW5lUmVjZWl2ZWQiOiJDb21pcm5hdHkiLCJ2YWNjaW5lRGF0ZSI6IjIwLUF1Zy0yMDIxIn0seyJ2YWNjaW5lUmVjZWl2ZWQiOiJDb21pcm5hdHkiLCJ2YWNjaW5lRGF0ZSI6IjA0LU9jdC0yMDIxIn1dLCJleHBpcnlEYXRlIjoiMDMtTWFyLTIwMjIifQ==","hashalg":"sha256","hash":"caed4092ce4cd4af205aa90653126b836ea94e2d2619fe7fb53ea71af24c11fa"}`
    const result = checkCertFormat(invalid)
    strictEqual(result.valid, false)
  })

  it("should return valid: false if hcert is not a Base64 JSON object", async () => {
    const invalid = `{"alg":"sha256","kid":"9e9e5863-b900-4f2f-b572-c48ee4ddee75cwtG6ZL54We1MmE","iss":"ZAF","iat":"2021-12-03T18:55:37.790","exp":"3M","hcert":"this is not a Base64 JSON object","hashalg":"sha256","hash":"12345678ce4cd4af205aa90653126b836ea94e2d2619fe7fb53ea71af24c11fa"}`
    const result = checkCertFormat(invalid)
    strictEqual(result.valid, false)
  })

  it("should return valid: true for valid certificate", async () => {
    const valid = `{"alg":"sha256","kid":"9e9e5863-b900-4f2f-b572-c48ee4ddee75cwtG6ZL54We1MmE","iss":"ZAF","iat":"2021-12-03T18:55:37.790","exp":"3M","hcert":"eyJ2ZXJzaW9uIjoiMi4wIiwiaWRUeXBlIjoiUlNBSUQiLCJpZE1hc2siOiI4ODAyMTAqKioqKio2IiwiZmlyc3ROYW1lIjoiQWRyaWFuIEpvaG4iLCJzdXJuYW1lIjoiRnJpdGgiLCJkYXRlT2ZCaXJ0aCI6IjEwLUZlYi0xOTg4IiwiaW1tdW5pemF0aW9uRXZlbnRzIjpbeyJ2YWNjaW5lUmVjZWl2ZWQiOiJDb21pcm5hdHkiLCJ2YWNjaW5lRGF0ZSI6IjIwLUF1Zy0yMDIxIn0seyJ2YWNjaW5lUmVjZWl2ZWQiOiJDb21pcm5hdHkiLCJ2YWNjaW5lRGF0ZSI6IjA0LU9jdC0yMDIxIn1dLCJleHBpcnlEYXRlIjoiMDMtTWFyLTIwMjIifQ==","hashalg":"sha256","hash":"caed4092ce4cd4af205aa90653126b836ea94e2d2619fe7fb53ea71af24c11fa"}`
    const result = checkCertFormat(valid)
    strictEqual(result.valid, true)
  })
})