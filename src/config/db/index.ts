import mongoose from 'mongoose'
import { success } from '../../utils/logger/logger'

export const connectDB = async (): Promise<void> => {
  try {
<<<<<<< HEAD
    let dbURI = process.env.ATLAS_URI

    console.log('process.env.NODE_ENV:', process.env.NODE_ENV)

    if (process.env.NODE_ENV === 'production') {
      dbURI = process.env.ATLAS_URI
    }
=======
    const dbURI = process.env.ATLAS_URI
>>>>>>> staging

    const conn = await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })

    success(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
