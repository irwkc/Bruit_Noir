import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '30d'

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET env variable is not set')
  }
  return secret
}

interface TokenPayload {
  sub: string
  email: string
  role: string
  type: 'access' | 'refresh'
}

export function createAccessToken(userId: string, email: string, role: string) {
  return jwt.sign({ sub: userId, email, role, type: 'access' } satisfies TokenPayload, getSecret(), {
    expiresIn: ACCESS_TOKEN_TTL,
  })
}

export function createRefreshToken(userId: string, email: string, role: string) {
  return jwt.sign({ sub: userId, email, role, type: 'refresh' } satisfies TokenPayload, getSecret(), {
    expiresIn: REFRESH_TOKEN_TTL,
  })
}

export function verifyToken(token: string, expectedType: 'access' | 'refresh') {
  const secret = getSecret()
  const payload = jwt.verify(token, secret) as TokenPayload
  if (payload.type !== expectedType) {
    throw new Error('Invalid token type')
  }
  return payload
}
