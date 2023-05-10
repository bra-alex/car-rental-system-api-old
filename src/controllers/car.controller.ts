import { Request, Response } from 'express'

import log from '../util/logger'
import { Car } from '../models/dto/userInputs'
import { findUser } from '../services/user.service'
import multipleUploads from '../util/multipleFileUpload'
import { deleteFolder } from '../util/deleteFromStorage'
import { Availability, MediaCategory } from '../models/enums'

import {
  CreateCarInput,
  DeleteCarInput,
  UpdateCarInput,
  ChangeCarAvailabilityInput,
} from '../schema/car.schema'

import {
  addCar,
  findCar,
  deleteCar,
  updateCar,
  availableCars,
  getCarHistory,
  changeAvailability,
} from '../services/car.service'

async function availableCarsHandler(_req: Request, res: Response) {
  try {
    const cars = await availableCars()
    return res.status(200).json(cars)
  } catch (e: any) {
    return res.status(400).json(e.message)
  }
}

async function addCarHandler(
  req: Request<Record<string, never>, Record<string, never>, CreateCarInput['body']>,
  res: Response,
) {
  try {
    const user = res.locals.user
    const carDetails = req.body as Car
    const files = req.files as Express.Multer.File[]
    const fileURLs = files.map(file => ({ mediaURL: file.path }))
    carDetails.media = [...fileURLs]

    if (carDetails.owner !== user._id) return res.sendStatus(400)

    const car = await addCar({ carDetails, userId: user._id })
    const compressedPath = `public/uploads/cars/${car.owner}/${car.carId}/`

    multipleUploads({ id: car.carId, files, compressedPath, category: MediaCategory.Car })

    return res.status(201).json(car)
  } catch (e: any) {
    log.error(e)

    return res.status(400).json(e.message)
  }
}

async function updateCarHandler(
  req: Request<UpdateCarInput['params'], Record<string, never>, UpdateCarInput['body']>,
  res: Response,
) {
  try {
    const files = req.files as Express.Multer.File[] | undefined
    const carId = req.params.carId
    const userId = res.locals.user._id
    const carDetails = req.body as Car

    if (files) {
      const fileURLs = files.map(file => ({ mediaURL: file.path }))
      carDetails.media = [...carDetails.media, ...fileURLs]
    }
    if (carDetails.owner !== userId) return res.sendStatus(403)

    const updatedCar = await updateCar({ carId }, carDetails, { new: true })

    if (files) {
      const compressedPath = `public/uploads/cars/${updatedCar?.owner}/${updatedCar?.carId}/`
      multipleUploads({
        id: updatedCar?.carId as string,
        files,
        compressedPath,
        category: MediaCategory.Car,
      })
    }

    return res.status(200).json(updatedCar)
  } catch (e: any) {
    log.error(e)

    return res.status(400).json(e.message)
  }
}

async function deleteCarHandler(
  req: Request<DeleteCarInput['params'], Record<string, never>, Record<string, never>>,
  res: Response,
) {
  try {
    const carId = req.params.carId
    const owner = res.locals.user._id
    const car = await findCar({ carId, owner })

    if (!car) return res.sendStatus(404)

    const ownerDetails = await findUser({ _id: car.owner })

    if (!ownerDetails) return res.sendStatus(404)

    await ownerDetails.removeCar(car._id.toString())

    deleteFolder(`/tmp/cars/${owner}`)
    deleteFolder(`/public/uploads/cars/${owner}/${carId}`)

    await deleteCar({ carId })

    return res.sendStatus(200)
  } catch (e: any) {
    log.error(e)

    return res.status(400).json(e.message)
  }
}

async function getCarHistoryHandler(
  req: Request<DeleteCarInput['params'], Record<string, never>, Record<string, never>>,
  res: Response,
) {
  try {
    const carId = req.params.carId
    const owner = res.locals.user._id
    const car = await findCar({ _id: carId })

    if (!car) return res.sendStatus(404)

    const history = await getCarHistory({ _id: carId, owner })
    if (!history) return res.sendStatus(404)

    return res.status(200).json(history)
  } catch (e: any) {
    log.error(e)

    return res.status(400).json(e.message)
  }
}

async function changeAvailabilityHandler(
  req: Request<
    ChangeCarAvailabilityInput['params'],
    Record<string, never>,
    ChangeCarAvailabilityInput['body']
  >,
  res: Response,
) {
  try {
    const carId = req.params.carId
    const owner = res.locals.user._id
    const availability: Availability = req.body.availability

    const updatedCar = await changeAvailability({ filter: { _id: carId, owner }, availability })

    return res.status(200).json(updatedCar)
  } catch (e: any) {
    log.error(e)

    return res.sendStatus(404)
  }
}

export {
  addCarHandler,
  updateCarHandler,
  deleteCarHandler,
  getCarHistoryHandler,
  availableCarsHandler,
  changeAvailabilityHandler,
}
