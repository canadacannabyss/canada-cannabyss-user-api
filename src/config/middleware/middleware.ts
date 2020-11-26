import { Application, urlencoded, json } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import session from 'express-session'
import cookieSession from 'cookie-session'
import cookieKey from '../cookies/keys'
import passport from 'passport'
import dotenv from 'dotenv'

export default (app: Application): void => {
  dotenv.config()

  app.use(
    cookieSession({
      maxAge: 24 * 60 * 60 * 1000,
      keys: [cookieKey.session.cookieKey],
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())

  app.use(cors())

  app.use(json())

  app.use(
    urlencoded({
      extended: false,
    }),
  )

  // Express session
  app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      // store: new MongoStore({
      //   mongooseConnection: mongoose.connection,
      //   collection: 'sessions',
      // }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  )

  // Switch file storage from development to production
  app.use(morgan('dev'))
}
