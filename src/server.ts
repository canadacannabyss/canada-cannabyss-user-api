import express from 'express'
import path from 'path'

import { success } from './utils/logger/logger'
import middlewareConfig from './config/middleware/middleware'
import { connectDB } from './config/db'

import routes from './routes/index'

const app = express()

middlewareConfig(app)

app.use(
  '/files',
  express.static(path.resolve(__dirname, '.', 'tmp', 'uploads')),
)

routes(app)

connectDB()

const port = process.env.PORT || 5002

app.listen(port, () => {
  success(`${process.env.APP_NAME} is listening on port: ${process.env.PORT}`)
})
