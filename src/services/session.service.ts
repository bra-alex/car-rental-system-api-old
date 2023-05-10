import config from 'config'
import { get } from 'lodash'

import { findUser } from './user.service'
import { signJWT, validateJWT } from '../util/jwt'
import SessionModel from '../models/session.mongo'

async function createSession(user: string, payload: object) {
  const session = await SessionModel.create({ user })

  const accessToken = signJWT(
    {
      ...payload,
      session: session._id,
    },
    {
      expiresIn: config.get<string>('accessTokenTTL'),
    },
  )

  const refreshToken = signJWT(
    {
      ...payload,
      session: session._id,
    },
    {
      expiresIn: config.get<string>('refreshTokenTTL'),
    },
  )

  return {
    session: session._id,
    accessToken,
    refreshToken,
  }
}

async function deleteSession(sessionId: string) {
  return await SessionModel.deleteOne({ _id: sessionId })
}

async function refreshSession(refreshToken: string) {
  const { decoded } = validateJWT(refreshToken)

  if (!decoded || !get(decoded, 'session')) return false

  const session = await SessionModel.findById(get(decoded, 'session'))

  if (!session || !session.valid) return false

  const user = await findUser({ _id: session.user })

  if (!user) return false

  const accessToken = signJWT(
    {
      ...user.toJSON(),
      session: session._id,
    },
    {
      expiresIn: config.get<string>('accessTokenTTL'),
    },
  )

  return accessToken
}

export { createSession, deleteSession, refreshSession }
