import mongoose from 'mongoose'
import { success } from '../../utils/logger/logger'

export const connectDB = async (): Promise<void> => {
  try {
    const dbURI = process.env.ATLAS_URI

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
