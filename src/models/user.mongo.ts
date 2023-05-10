import mongoose from 'mongoose'

import { Roles } from './enums'
import { User } from './dto/userInputs'

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  placeOfResidence: {
    lat: String,
    long: String,
  },
  role: {
    type: Number,
    required: true,
  },
  identificationCard: String,
  reservations: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Reservation',
    },
  ],
  cars: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Car',
      },
    ],
    default: undefined,
  },
})

userSchema.methods.addCar = async function (carId: string) {
  const user = this as User
  user.cars?.push(carId)
  return await user.save()
}

userSchema.methods.removeCar = async function (carId: string) {
  const user = this as User
  user.cars = user.cars?.filter(car => car.toString() !== carId)
  return await user.save()
}

userSchema.methods.addReservation = async function (reservationId: string) {
  const user = this as User
  user.reservations.push(reservationId)
  return await user.save()
}

userSchema.methods.removeReservation = async function (reservationId: string) {
  const user = this as User
  user.reservations = user.reservations.filter(reservation => reservation !== reservationId)
  return await user.save()
}

userSchema.methods.upgradeToRenter = async function () {
  const user = this as User
  user.role = Roles.Renter
  return await user.save()
}

userSchema.methods.updateProfilePicture = async function (imageUrl: string) {
  const user = this as User
  user.profilePicture = imageUrl
  return await user.save()
}

const UserModel = mongoose.model<User>('User', userSchema)

export default UserModel
