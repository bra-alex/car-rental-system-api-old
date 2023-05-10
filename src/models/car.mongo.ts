import mongoose from 'mongoose'

import { Car } from './dto/userInputs'
import { Availability } from './enums'

const carSchema = new mongoose.Schema({
  carId: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  yearOfManufacture: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  plan: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  location: {
    type: String,
    required: true,
  },
  maxDuration: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  terms: {
    type: String,
    required: true,
  },
  rentalHistory: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Reservation',
    },
  ],
  media: [
    {
      mediaURL: String,
    },
  ],
})

carSchema.methods.changeAvailability = async function (availability: Availability) {
  const car = this as Car
  car.availability = availability
  return await car.save()
}

carSchema.methods.addReservation = async function (reservationId: string) {
  const car = this as Car
  car.rentalHistory?.push(reservationId)
  return await car.save()
}

carSchema.methods.removeReservation = async function (reservationId: string) {
  const car = this as Car
  car.rentalHistory = car.rentalHistory?.filter(reservation => reservation !== reservationId)
  return await car.save()
}

carSchema.methods.updateCarMedia = async function (oldURL: string, newURL: string) {
  const car = this as Car
  const index = car.media.findIndex(media => media.mediaURL === oldURL)

  car.media[index] = { mediaURL: newURL }
  console.log(car.media[index])

  return await car.save()
}

const CarModel = mongoose.model<Car>('Car', carSchema)

export default CarModel
