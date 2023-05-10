import multer from 'multer'
import express from 'express'

import isRenter from '../middlewares/isRenter'
import requireUser from '../middlewares/requireUser'
import validateInput from '../middlewares/validateInput'
import { carFileFilter, carFileStorage } from '../util/multer.config'

import {
  changeCarAvailabilitySchema,
  createCarSchema,
  deleteCarSchema,
  updateCarSchema,
} from '../schema/car.schema'

import {
  addCarHandler,
  deleteCarHandler,
  updateCarHandler,
  availableCarsHandler,
  getCarHistoryHandler,
  changeAvailabilityHandler,
} from '../controllers/car.controller'

const carsRoute = express.Router()

carsRoute.get('/available', requireUser, availableCarsHandler)
carsRoute.get(
  '/:carId/history',
  [requireUser, isRenter, validateInput(deleteCarSchema)],
  getCarHistoryHandler,
)

carsRoute.post(
  '/',
  [
    requireUser,
    isRenter,
    multer({ storage: carFileStorage, fileFilter: carFileFilter }).array('media'),
    validateInput(createCarSchema),
  ],
  addCarHandler,
)

carsRoute.patch(
  '/:carId/',
  [requireUser, isRenter, validateInput(updateCarSchema)],
  updateCarHandler,
)
carsRoute.patch(
  '/:carId/availability',
  [requireUser, isRenter, validateInput(changeCarAvailabilitySchema)],
  changeAvailabilityHandler,
)

carsRoute.delete(
  '/:carId/',
  [requireUser, isRenter, validateInput(deleteCarSchema)],
  deleteCarHandler,
)

export default carsRoute
