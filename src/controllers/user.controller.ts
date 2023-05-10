import { Request, Response } from 'express'

import log from '../util/logger'
import createChild from '../util/createChild'
import { Auth, User } from '../models/dto/userInputs'
import { MediaCategory, Roles } from '../models/enums'
import { createSession } from '../services/session.service'
import { createAuth, login, logout } from '../services/auth.service'
import { deleteFile, deleteFolder } from '../util/deleteFromStorage'

import {
  findUser,
  createUser,
  deleteUser,
  updateUser,
  upgradeToRenter,
  getUserReservationHistory,
  clearUserReservationHistory,
} from '../services/user.service'

import {
  LoginInput,
  GetUserInput,
  CreateUserInput,
  DeleteUserInput,
  UpdateUserInput,
  UpgradeUserInput,
  GetUserReservationHistoryInput,
  ClearUserReservationHistoryInput,
} from '../schema/user.schema'

async function createUserHandler(
  req: Request<Record<string, never>, Record<string, never>, CreateUserInput['body']>,
  res: Response,
) {
  try {
    const image = req.file as Express.Multer.File
    const signUpDetails = req.body as User

    signUpDetails.role = Roles.User
    signUpDetails.profilePicture = image.path

    const auth = await createAuth({
      email: signUpDetails.email,
      password: signUpDetails.password,
    } as Auth)

    if (!auth) throw new Error('Could not create user')

    const user = await createUser(signUpDetails)

    if (!user) throw new Error('Could not create user')

    const session = await createSession(user._id, user)

    if (!session) throw new Error('Could not create user')

    const compressedPath = `./public/uploads/users/${user.userId}/avatar/`
    createChild({ id: user.userId, file: image, compressedPath, category: MediaCategory.User })

    return res.status(201).json({
      user,
      session,
    })
  } catch (e: any) {
    log.error(e)

    return res.sendStatus(409)
  }
}

async function loginHandler(
  req: Request<Record<string, never>, Record<string, never>, LoginInput['body']>,
  res: Response,
) {
  try {
    const user = await login(req.body)

    if (!user) throw new Error('User not found')

    const session = await createSession(user._id, user)

    if (!session) throw new Error('User not found')

    return res.status(200).json({ user, session })
  } catch (e: any) {
    log.error(e)
    return res.status(404).json(e.message)
  }
}

async function logoutHandler(_req: Request, res: Response) {
  await logout(res.locals.user.session)

  return res.sendStatus(200)
}

async function updateUserHandler(
  req: Request<UpdateUserInput['params'], Record<string, never>, UpdateUserInput['body']>,
  res: Response,
) {
  try {
    const id = req.params.userId

    if (id !== res.locals.user._id) return res.sendStatus(403)

    const updatedAvatar = req.file
    const userDetails = req.body as User
    userDetails._id = id

    if (updatedAvatar) {
      deleteFile(userDetails.profilePicture)
      userDetails.profilePicture = updatedAvatar.path
    }

    const updatedUser = await updateUser({ _id: id }, userDetails, { new: true })

    if (updatedAvatar) {
      const compressedPath = `./public/uploads/users/${userDetails.userId}/avatar/`
      createChild({
        id: userDetails.userId,
        file: updatedAvatar,
        compressedPath,
        category: MediaCategory.User,
      })
    }

    return res.status(200).json(updatedUser)
  } catch (e: any) {
    return res.status(400).json(e.message)
  }
}

async function deleteUserHandler(
  req: Request<DeleteUserInput['params'], Record<string, never>, Record<string, never>>,
  res: Response,
) {
  try {
    const userId = req.params.userId

    if (userId !== res.locals.user._id) return res.sendStatus(403)

    deleteFolder(`/tmp/users/${res.locals.user.userId}/`)
    deleteFolder(`/public/uploads/users/${res.locals.user.userId}/`)

    await deleteUser({ _id: userId }, res.locals.user.session)

    return res.sendStatus(200)
  } catch (e: any) {
    log.error(e)

    return res.sendStatus(400)
  }
}

async function getUserHandler(
  req: Request<GetUserInput['params'], Record<string, never>, Record<string, never>>,
  res: Response,
) {
  try {
    const user = await findUser({ _id: req.params.userId })

    if (!user) return res.sendStatus(404)

    return res.status(200).json(user)
  } catch (e: any) {
    log.error(e)
    return res.sendStatus(400)
  }
}

async function getUserReservationHistoryHandler(
  req: Request<
    GetUserReservationHistoryInput['params'],
    Record<string, never>,
    Record<string, never>
  >,
  res: Response,
) {
  try {
    const userId = req.params.userId
    const history = await getUserReservationHistory({ _id: userId })

    return res.status(200).json(history)
  } catch (e: any) {
    log.error(e)
    return res.sendStatus(404)
  }
}

async function clearUserReservationHistoryHandler(
  req: Request<
    ClearUserReservationHistoryInput['params'],
    Record<string, never>,
    Record<string, never>
  >,
  res: Response,
) {
  try {
    const userId = req.params.userId

    if (userId !== res.locals.user._id) return res.sendStatus(403)

    await clearUserReservationHistory({ _id: userId })

    return res.sendStatus(200)
  } catch (e: any) {
    log.error(e)
    return res.sendStatus(404)
  }
}

async function upgradeToRenterHandler(
  req: Request<UpgradeUserInput['params'], Record<string, never>, Record<string, never>>,
  res: Response,
) {
  try {
    const userId = req.params.userId
    const upgradedUser = await upgradeToRenter({ _id: userId })

    return res.status(200).json(upgradedUser)
  } catch (e: any) {
    log.error(e)

    return res.sendStatus(400)
  }
}

export {
  loginHandler,
  logoutHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
  createUserHandler,
  upgradeToRenterHandler,
  getUserReservationHistoryHandler,
  clearUserReservationHistoryHandler,
}
