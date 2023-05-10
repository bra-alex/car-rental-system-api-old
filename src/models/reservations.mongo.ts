import mongoose from 'mongoose'

import { Reservation } from './dto/userInputs'
import { ReservationStatus } from './enums'

const reservationSchema = new mongoose.Schema({
  customer: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  renter: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Renter',
  },
  car: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Car',
  },
  startDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
})

reservationSchema.methods.updateStatus = async function (status: ReservationStatus) {
  const reservation = this as Reservation
  reservation.status = status
  return await reservation.save()
}

const ReservationModel = mongoose.model<Reservation>('Reservation', reservationSchema)

export default ReservationModel
