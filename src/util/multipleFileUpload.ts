import { MediaCategory } from '../models/enums'
import createChild from './createChild'

export default function multipleUploads({
  id,
  files,
  compressedPath,
  category,
}: {
  id: string
  files: Express.Multer.File[]
  compressedPath: string
  category: MediaCategory
}) {
  for (const file of files) {
    createChild({
      id,
      file,
      compressedPath,
      category,
    })
  }
}
