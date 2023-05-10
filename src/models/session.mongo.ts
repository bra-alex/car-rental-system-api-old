import mongoose from 'mongoose'

import { Session } from './dto/userInputs'

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    userAgent: String,
  },
  {
    timestamps: true,
  },
)

const SessionModel = mongoose.model<Session>('Session', sessionSchema)

export default SessionModel
