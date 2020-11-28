import { Request } from 'express'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import aws from 'aws-sdk'
import multerS3 from 'multer-sharp-s3'

const storageTypes = {
  local: multer.diskStorage({
    destination: (req: Request, file, cb) => {
      cb(null, path.resolve(__dirname, '..', 'tmp', 'uploads'))
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err)

        file.key = `${hash.toString('hex')}-${file.originalname}`

        cb(null, file.key)
      })
    },
  }),
  s3: multerS3({
    Key: (req: Request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err)

        console.log('Multer request session:', req.session.destination)

        const fileName = `${req.session.destination}/${hash.toString('hex')}-${
          file.originalname
        }`

        console.log('fileName:', fileName)

        cb(null, fileName)
      })
    },
    s3: new aws.S3(),
    Bucket: 'canada-cannabyss',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    ACL: 'public-read',
    resize: {
      width: 960,
      height: 540,
    },
  }),
}

export default {
  dest: path.resolve(__dirname, '..', 'tmp', 'uploads'),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: 150 * 1024 * 1024,
  },
  fileFilter: (req: Request, file, cb) => {
    const allowedMimes: string[] = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/acc',
      'audio/ogg',
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type.'))
    }
  },
}
