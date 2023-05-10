import { Request, Response, NextFunction } from 'express'

import { validateJWT } from '../util/jwt'
import { refreshSession } from '../services/session.service'

export default async function deserializeUser(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.get('Authorization')?.replace(/^Bearer\s/, '')
  const refreshToken = req.get('x-refresh')

  if (!accessToken) return next()

  const { decoded, expired } = validateJWT(accessToken)

  if (decoded) {
    res.locals.user = decoded
    return next()
  }

  if (expired && refreshToken) {
    const newAccessToken = await refreshSession(refreshToken)

    if (newAccessToken) {
      res.setHeader('x-access-token', newAccessToken)
    }

    const { decoded } = validateJWT(newAccessToken as string)

    res.locals.user = decoded

    return next()
  }

  return next()
}
