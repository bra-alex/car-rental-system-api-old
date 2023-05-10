import http from 'http'
import dotenv from 'dotenv'
dotenv.config()

import config from 'config'

import app from './app'
import log from './util/logger'
import { mongoConnect } from './util/mongo'

const server = http.createServer(app)
const PORT = config.get<number>('port')

server.listen(PORT, async () => {
  log.info('Connected')
  await mongoConnect()
})
