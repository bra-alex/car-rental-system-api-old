import config from 'config'
import jwt from 'jsonwebtoken'

const accessTokenPublicKey = config.get<string>('accessTokenPublicKey')
const accessTokenPrivateKey = config.get<string>('accessTokenPrivateKey')

function signJWT(object: object, options?: jwt.SignOptions) {
  return jwt.sign(object, accessTokenPrivateKey, {
    ...(options && options),
    algorithm: 'RS256',
  })
}

function validateJWT(accessToken: string) {
  try {
    const decoded = jwt.verify(accessToken, accessTokenPublicKey)
    return {
      valid: true,
      expired: false,
      decoded,
    }
  } catch (e: any) {
    return {
      valid: false,
      expired: e.message === 'jwt expired',
      decoded: null,
    }
  }
}

export { signJWT, validateJWT }
