import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'

import { mongoConnect } from './mongo'
import { updateCarMedia } from '../services/car.service'

export default async function videoCompressor(
  file: Express.Multer.File,
  compressedPath: string,
  carId: string,
) {
  const withoutEXT = file.filename.split('.')[0]
  const finalPath = `${compressedPath}${withoutEXT}.mp4`

  if (!fs.existsSync(compressedPath)) fs.mkdirSync(compressedPath, { recursive: true })

  ffmpeg(file.path)
    .videoCodec('libx265')
    .audioBitrate(128)
    .outputFormat('mp4')
    .on('start', () => console.log('Compression started'))
    .on('end', async () => {
      await mongoConnect()
      await updateCarMedia({ carId }, file.path, finalPath)
      process.exit()
    })
    .on('error', e => {
      console.log(e)
      process.exit()
    })
    .save(finalPath)
}
