import config from 'config'
import mongoose from 'mongoose'

import log from './logger'

mongoose.connection.on('open', () => log.info('Connected to mongo db'))
mongoose.connection.on('error', e => log.info(e))

async function mongoConnect() {
  return await mongoose.connect(config.get<string>('mongoUrl'))
}

export { mongoConnect }
