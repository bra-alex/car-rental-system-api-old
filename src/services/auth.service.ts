import { FilterQuery } from 'mongoose'

import UserModel from '../models/user.mongo'
import AuthModel from '../models/auth.mongo'
import { Auth } from '../models/dto/userInputs'
import { deleteSession } from './session.service'

async function createAuth(authDetails: Auth) {
  try {
    const auth = AuthModel.create(authDetails)
    return auth
  } catch (e: any) {
    throw new Error(e)
  }
}

async function login({ email, password }: { email: string; password: string }) {
  const auth = await AuthModel.findOne({ email })

  if (!auth) throw new Error('Invalid email or password')

  const isValid = await auth.comparePassword(password)

  if (!isValid) throw new Error('Invalid email or password')

  return await UserModel.findOne({ email }).lean()
}

async function logout(sessionId: string) {
  return await deleteSession(sessionId)
}

async function deleteUserAuth(query: FilterQuery<Auth>) {
  return await AuthModel.deleteOne(query)
}

export { createAuth, login, logout, deleteUserAuth }
