import express from 'express'

import requireUser from '../middlewares/requireUser'
import validateInput from '../middlewares/validateInput'
import { createUserSchema } from '../schema/user.schema'
import { createRenterHandler, getRenterCarsHandler } from '../controllers/renter.controller'

const renterRoute = express.Router()

renterRoute.get('/:userId/cars', requireUser, getRenterCarsHandler)
renterRoute.post('/', validateInput(createUserSchema), createRenterHandler)

export default renterRoute
