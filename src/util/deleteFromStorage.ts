import fs from 'fs'
import path from 'path'

function deleteFile(filePath: string) {
  filePath = path.join(__dirname, '..', '..', filePath)

  fs.unlink(filePath, err => {
    if (err) {
      throw err
    }
  })
}

function deleteFolder(folderPath: string) {
  folderPath = path.join(__dirname, '..', '..', folderPath)

  const fileOptions: fs.RmOptions = { recursive: true, force: true }

  fs.rm(folderPath, fileOptions, () => {
    console.log('Deleted')
  })
}

export { deleteFile, deleteFolder }
