import fetch, { Response } from 'cross-fetch'
import { SHA256, enc } from 'crypto-js'

interface Success {
  valid: true
  qrcode: any
  cert: any
}

interface Failure {
  valid: false
  reason: VerificationError
}

export enum VerificationError {
  InvalidJson = 2,
  MissingField = 3,
  InvalidHash = 4,
  CertFormat = 5,
  ApiBadResponse = 6,
  ApiBadJson = 7,
  ApiNotValid = 8
}

export type VerifyResult = Success | Failure

const keys: string[] = ['alg', 'kid', 'iss', 'iat', 'exp', 'hcert', 'hashalg']

export const checkCertFormat = (qrcode: string): VerifyResult => {
  let qrObj: any
  try {
    qrObj = JSON.parse(qrcode)
  } catch (err) {
    return { valid: false, reason: VerificationError.InvalidJson }
  }

  const badKeys = keys.filter(k => (typeof qrObj[k] !== 'string'))
  if (badKeys.length > 0) {
    return { valid: false, reason: VerificationError.MissingField }
  }
  const dataToHash = keys.map(k => qrObj[k]).join('--')
  const hash = SHA256(dataToHash).toString()

  if (typeof qrObj.hash !== 'string' || hash !== qrObj.hash) {
    return { valid: false, reason: VerificationError.InvalidHash }
  }

  try {
    const cert = JSON.parse(enc.Utf8.stringify(enc.Base64.parse(qrObj.hcert)))
    return { valid: true, qrcode: qrObj, cert }
  } catch (err) {
    return { valid: false, reason: VerificationError.CertFormat }
  }
}

interface VerifyOptions {
  endpointUrl?: string
}

export const verifyCert = async (qrcode: string, options?: VerifyOptions): Promise<VerifyResult> => {
  const validity = checkCertFormat(qrcode)
  if (!validity.valid) {
    return validity
  }
  const { kid, hash } = validity.qrcode
  let response: Response

  try {
    response = await fetch(
      options?.endpointUrl ?? 'https://vaccine.certificate.health.gov.za/ms/rs/verification/verify2_0/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kid, hash })
      }
    )
  } catch (err) {
    return { valid: false, reason: VerificationError.ApiBadResponse }
  }

  if (!response.ok) {
    return { valid: false, reason: VerificationError.ApiBadResponse }
  }

  let result
  try {
    result = await response.json()
  } catch (err) {
    return { valid: false, reason: VerificationError.ApiBadJson }
  }
  if (result.isValid === true) {
    return validity
  } else {
    return { valid: false, reason: VerificationError.ApiNotValid }
  }
}
