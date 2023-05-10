import path from 'path'
import express, { Express } from 'express'

import routes from './routes'
import deserializeUser from './middlewares/deserializeUser'

const app: Express = express()

app.use(express.json())
app.use(deserializeUser)
app.use('/public', express.static(path.join(__dirname, '..', 'public')))

routes(app)

export default app
