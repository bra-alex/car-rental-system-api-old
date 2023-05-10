import { fork } from 'child_process'

import { MediaCategory } from '../models/enums'

export default function createChild({
  id,
  file,
  compressedPath,
  category,
}: {
  id: string
  file: Express.Multer.File
  compressedPath: string
  category: MediaCategory
}) {
  const child = fork('src/util/compression')

  child.send({ file, compressedPath, id, category })
}
