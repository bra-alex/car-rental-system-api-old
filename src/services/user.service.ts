import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'

import { Roles } from '../models/enums'
import { deleteCar } from './car.service'
import UserModel from '../models/user.mongo'
import { User } from '../models/dto/userInputs'
import { deleteUserAuth } from './auth.service'
import { deleteSession } from './session.service'

async function createUser(userDetails: User) {
  try {
    const user = await UserModel.create(userDetails)

    return user.toJSON()
  } catch (e: any) {
    throw new Error(e)
  }
}

async function updateUser(
  filter: FilterQuery<User>,
  update: UpdateQuery<User>,
  options: QueryOptions,
) {
  try {
    return await UserModel.findOneAndUpdate(filter, update, options)
  } catch (e: any) {
    throw new Error(e)
  }
}

async function deleteUser(filter: FilterQuery<User>, sessionId: string) {
  const user = await findUser(filter)
  if (user && user.role === Roles.Renter) {
    const userCars: string[] = user.cars as string[]
    for (const car of userCars) {
      await deleteCar({ _id: car })
    }
  }
  await deleteUserAuth({ email: user?.email })
  await deleteSession(sessionId)

  return await UserModel.deleteOne(filter)
}

async function findUser(filter: FilterQuery<User>) {
  return await UserModel.findOne(filter)
}

async function getUserReservationHistory(filter: FilterQuery<User>) {
  const user = await UserModel.findOne(filter).populate('reservations')
  if (!user) throw new Error('User not found')

  return user.reservations
}

async function clearUserReservationHistory(filter: FilterQuery<User>) {
  const user = await findUser(filter)

  if (!user) throw new Error('User not found')

  for (const reservation of user.reservations) {
    await user.removeReservation(reservation)
  }

  return { message: 'History deleted' }
}

async function upgradeToRenter(filter: FilterQuery<User>) {
  const user = await findUser(filter)
  if (!user) throw new Error('User not found')

  if (user.role === Roles.Renter) throw new Error('User is already a renter')

  return await user.upgradeToRenter()
}

async function updateProfilePicture(userId: string, imageUrl: string) {
  const user = await findUser({ userId })
  return await user?.updateProfilePicture(imageUrl)
}

export {
  findUser,
  createUser,
  updateUser,
  deleteUser,
  upgradeToRenter,
  updateProfilePicture,
  getUserReservationHistory,
  clearUserReservationHistory,
}
