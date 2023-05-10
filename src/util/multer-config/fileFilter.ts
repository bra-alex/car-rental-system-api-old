import { Request } from 'express'
import { FileFilterCallback } from 'multer'

import { imageMimeTypes, videoMimeTypes } from '../../models/mimeTypes'

const userFileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  if (imageMimeTypes.includes(file.mimetype)) callback(null, true)
  else callback(null, false)
}

const carFileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  if (imageMimeTypes.includes(file.mimetype) || videoMimeTypes.includes(file.mimetype))
    callback(null, true)
  else callback(null, false)
}

export { userFileFilter, carFileFilter }
