import { MediaCategory } from '../models/enums'
import imageCompressor from './imageCompressor'
import videoCompressor from './videoCompressor'
import { imageMimeTypes } from '../models/mimeTypes'

process.on(
  'message',
  async ({
    file,
    compressedPath,
    id,
    category,
  }: {
    file: Express.Multer.File
    compressedPath: string
    id: string
    category: MediaCategory
  }) => {
    console.log('Compression Starting...')

    if (imageMimeTypes.includes(file.mimetype)) {
      await imageCompressor(id, compressedPath, category, file)
    } else {
      console.log('video compressing')

      await videoCompressor(file, compressedPath, id)
    }
  },
)
