import { Request, Response } from 'express'

import log from '../util/logger'
import createChild from '../util/createChild'
import { createAuth } from '../services/auth.service'
import { Auth, User } from '../models/dto/userInputs'
import { createUser } from '../services/user.service'
import { MediaCategory, Roles } from '../models/enums'
import { CreateUserInput } from '../schema/user.schema'
import { getRenterCars } from '../services/renter.service'
import { createSession } from '../services/session.service'

async function createRenterHandler(
  req: Request<Record<string, never>, Record<string, never>, CreateUserInput['body']>,
  res: Response,
) {
  try {
    const signUpDetails = req.body as User
    const image = req.file as Express.Multer.File

    signUpDetails.cars = []
    signUpDetails.role = Roles.Renter
    signUpDetails.profilePicture = image.path

    const auth = await createAuth({
      email: signUpDetails.email,
      password: signUpDetails.password,
    } as Auth)

    if (!auth) throw new Error('Could not create renter')

    const renter = await createUser(signUpDetails)

    if (!renter) throw new Error('Could not create renter')

    const session = await createSession(renter._id, renter)

    if (!session) throw new Error('Could not create renter')

    const compressedPath = `./public/uploads/users/${renter.userId}/avatar/`
    createChild({ id: renter.userId, file: image, compressedPath, category: MediaCategory.User })

    return res.status(201).json({ renter, session })
  } catch (e: any) {
    log.info(e)

    return res.sendStatus(409)
  }
}

async function getRenterCarsHandler(req: Request, res: Response) {
  try {
    const cars = await getRenterCars(req.params.userId)

    return res.status(200).json(cars)
  } catch (e: any) {
    log.info(e)

    return res.status(404).json('User not found')
  }
}

export { createRenterHandler, getRenterCarsHandler }
