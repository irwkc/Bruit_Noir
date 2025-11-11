import { authenticator } from 'otplib'
import QRCode from 'qrcode'

const ISSUER = 'Bruit Noir Admin'

authenticator.options = {
  step: 30,
  window: 1,
}

export async function generateTotpSecret(email: string) {
  const secret = authenticator.generateSecret()
  return buildTotpAssets(email, secret)
}

export function verifyTotp(secret: string, token: string) {
  if (!secret || !token) return false
  return authenticator.verify({ token, secret })
}

export async function buildTotpAssets(email: string, secret: string) {
  const otpauth = authenticator.keyuri(email, ISSUER, secret)
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth)
  return { secret, otpauth, qrCodeDataUrl }
}
