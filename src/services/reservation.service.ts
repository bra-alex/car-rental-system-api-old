import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'

import { findCar } from './car.service'
import { findUser } from './user.service'
import { ReservationStatus } from '../models/enums'
import { Reservation } from '../models/dto/userInputs'
import ReservationModel from '../models/reservations.mongo'

async function createReservation(reservationDetails: Reservation) {
  const customer = await findUser({ _id: reservationDetails.customer.id })
  const car = await findCar({ _id: reservationDetails.car })

  if (!customer || !car) throw new Error('Reservation could not be created')

  const reservation = await ReservationModel.create(reservationDetails)

  await customer.addReservation(reservation._id)
  await car.addReservation(reservation._id)

  return reservation
}

async function updateReservationStatus({
  status,
  filter,
}: {
  status: ReservationStatus
  filter: FilterQuery<Reservation>
}) {
  const reservation = await ReservationModel.findOne(filter)

  if (!reservation) throw new Error('Reservation does not exist')

  return await reservation.updateStatus(status)
}

async function updateReservation(
  filter: FilterQuery<Reservation>,
  update: UpdateQuery<Reservation>,
  options: QueryOptions,
) {
  return await ReservationModel.findOneAndUpdate(filter, update, options)
}

async function deleteReservation(filter: FilterQuery<Reservation>) {
  const reservation = await ReservationModel.findOne(filter)
  if (!reservation) throw new Error('Reservation not found')

  const car = await findCar({ _id: reservation.car })
  const customer = await findUser({ _id: reservation.customer.id })

  if (!customer || !car) throw new Error('Reservation not found')

  await car.removeReservation(reservation._id)
  await customer.removeReservation(reservation._id)

  return await ReservationModel.findOneAndDelete(filter)
}

async function renterDeleteReservation(reservationId: string) {
  const reservation = await ReservationModel.findOne({ _id: reservationId })
  if (!reservation) throw new Error('Reservation not found')

  const car = await findCar({ _id: reservation.car })
  if (!car) throw new Error('Reservation not found')

  await reservation.updateStatus(ReservationStatus.Cancelled)

  return await car.removeReservation(reservationId)
}

async function userDeleteReservation(reservationId: string, userId: string) {
  const reservation = await ReservationModel.findOne({ _id: reservationId })
  if (!reservation) throw new Error('Reservation not found')

  const customer = await findUser({ _id: userId })
  if (!customer) throw new Error('Reservation not found')

  await reservation.updateStatus(ReservationStatus.Cancelled)

  return await customer.removeReservation(reservationId)
}

export {
  createReservation,
  updateReservationStatus,
  updateReservation,
  deleteReservation,
  renterDeleteReservation,
  userDeleteReservation,
}
