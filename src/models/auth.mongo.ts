import bcrypt from 'bcrypt'
import config from 'config'
import mongoose from 'mongoose'

import { Auth } from './dto/userInputs'

const authSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
})
authSchema.pre('save', async function (next) {
  const user = this as Auth

  if (!user.isModified) return next()
  const saltFactor = config.get<number>('saltFactor')
  const salt = await bcrypt.genSalt(saltFactor)
  const password = await bcrypt.hash(user.password, salt)

  user.password = password

  next()
})

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const user = this as Auth

  return await bcrypt.compare(password, user.password)
}

const AuthModel = mongoose.model<Auth>('Auth', authSchema, 'auth')

export default AuthModel
