import mongoose from 'mongoose'

import { ReservationStatus, Roles } from './enums'
import { Auth } from './dto/userInputs'

const userId = new mongoose.Types.ObjectId()

// User Details
// Session
const sessionPayload = {
  accessToken: '',
  refreshToken: '',
  session: userId.toString(),
}

// Auth
const authDetails = {
  email: 'Mandy_Marquardt78@hotmail.com',
  password: 'password',
} as Auth

const renterAuthDetails = {
  email: 'Maximo.Barrows@gmail.com',
  password: 'password',
} as Auth

const invalidEmail = {
  email: 'test@test.com',
  password: 'password',
} as Auth

const invalidPassword = {
  email: 'Mandy_Marquardt78@hotmail.com',
  password: '123456789',
} as Auth

const authPayload = {
  _id: userId,
  email: 'Mandy_Marquardt78@hotmail.com',
  password: 'password',
} as Auth

const renterAuthPayload = {
  _id: userId,
  email: 'Maximo.Barrows@gmail.com',
  password: 'password',
} as Auth

// User
const userInput = {
  name: 'Alyssa Rolfson',
  age: 20,
  phoneNumber: '(901) 919-5975 x61383',
  email: 'Mandy_Marquardt78@hotmail.com',
  password: 'password',
  dob: new Date('10-01-2000').toISOString(),
  role: Roles.User,
}

const userInputWithMissingFields = {
  name: 'Alyssa Rolfson',
  age: 20,
  phoneNumber: '(901) 919-5975 x61383',
  password: 'password',
  dob: new Date('10-01-2000').toISOString(),
  role: Roles.User,
}

const userPayload = {
  _id: userId,
  name: 'Alyssa Rolfson',
  age: 20,
  phoneNumber: '(901) 919-5975 x61383',
  email: 'Mandy_Marquardt78@hotmail.com',
  password: 'password',
  dob: new Date('10-01-2000').toISOString(),
  role: Roles.User,
}

const updateUserPayload = {
  _id: userPayload._id.toString(),
  name: 'Alyssa Rolfson',
  age: 20,
  phoneNumber: '(901) 919-5975 x61383',
  email: 'Mandy_Marquardt78@hotmail.com',
  password: 'password',
  dob: new Date('10-01-2000').toISOString(),
  role: Roles.User,
}

const userPayloadWithSession = {
  session: {
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
    session: expect.any(String),
  },
  user: {
    _id: expect.any(String),
    name: 'Alyssa Rolfson',
    age: 20,
    phoneNumber: '(901) 919-5975 x61383',
    email: 'Mandy_Marquardt78@hotmail.com',
    password: 'password',
    role: Roles.User,
    dob: userPayload.dob,
  },
}

const userJwt = {
  ...userPayload,
  session: userId.toString(),
}

// Renter
const renterInput = {
  name: 'Alexander Rowe',
  age: 20,
  phoneNumber: '1-431-965-3155 x5963',
  email: 'Maximo.Barrows@gmail.com',
  password: 'password',
  dob: new Date('10-01-2000').toISOString(),
  role: Roles.Renter,
  cars: [],
}

const renterInputWithMissingFields = {
  name: 'Alexander Rowe',
  age: 20,
  phoneNumber: '1-431-965-3155 x5963',
  password: 'password',
  dob: new Date('10-01-2000').toISOString(),
  role: Roles.Renter,
}

const renterPayload = {
  _id: userId,
  name: 'Alexander Rowe',
  age: 20,
  phoneNumber: '1-431-965-3155 x5963',
  email: 'Maximo.Barrows@gmail.com',
  password: 'password',
  dob: new Date('10-01-2000').toISOString(),
  role: Roles.Renter,
  cars: expect.any(Array),
}

const renterPayloadWithSession = {
  session: {
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
    session: expect.any(String),
  },
  renter: {
    _id: expect.any(String),
    name: 'Alexander Rowe',
    age: 20,
    phoneNumber: '1-431-965-3155 x5963',
    email: 'Maximo.Barrows@gmail.com',
    password: 'password',
    dob: renterPayload.dob,
    role: Roles.Renter,
    cars: expect.any(Object),
  },
}

const renterJwt = {
  ...renterPayload,
  session: userId.toString(),
}

// Car
const carInput = {
  owner: renterPayload._id.toString(),
  make: 'BMW',
  model: 'M3 Competition',
  capacity: 5,
  yearOfManufacture: '2019',
  registrationNumber: 'GT 7789-20',
  condition: 'Excellent',
  rate: 55,
  plan: '/hr',
  type: 'Sedan',
  availability: 1,
  location: 'KNUST',
  maxDuration: 5,
  description: "This is a really beautiful and strong car you're going to enjoy every moment in it",
  terms: 'You crash it, you buy it',
}

const updateCarInput = {
  owner: renterPayload._id.toString(),
  make: 'BMW',
  model: 'M3 Competition',
  capacity: 4,
  yearOfManufacture: '2019',
  registrationNumber: 'GT 7789-20',
  condition: 'Excellent',
  rate: 55,
  plan: '/hr',
  type: 'Sedan',
  availability: 1,
  location: 'KNUST',
  maxDuration: 5,
  description: "This is a really beautiful and strong car you're going to enjoy every moment in it",
  terms: 'You crash it, you buy it',
}

const carPayload = {
  _id: userId.toString(),
  owner: renterPayload._id.toString(),
  make: 'BMW',
  model: 'M3 Competition',
  capacity: 5,
  yearOfManufacture: '2019',
  registrationNumber: 'GT 7789-20',
  condition: 'Excellent',
  rate: 55,
  plan: '/hr',
  type: 'Sedan',
  availability: 1,
  location: 'KNUST',
  maxDuration: 5,
  description: "This is a really beautiful and strong car you're going to enjoy every moment in it",
  terms: 'You crash it, you buy it',
}

const updateCarPayload = {
  _id: userId.toString(),
  owner: renterPayload._id.toString(),
  make: 'BMW',
  model: 'M3 Competition',
  capacity: 4,
  yearOfManufacture: '2019',
  registrationNumber: 'GT 7789-20',
  condition: 'Excellent',
  rate: 55,
  plan: '/hr',
  type: 'Sedan',
  availability: 1,
  location: 'KNUST',
  maxDuration: 5,
  description: "This is a really beautiful and strong car you're going to enjoy every moment in it",
  terms: 'You crash it, you buy it',
}

const carInputOmitted = {
  owner: renterPayload._id,
  model: 'M3 Competition',
  capacity: 5,
  yearOfManufacture: '2019',
  registrationNumber: 'GT 7789-20',
  condition: 'Excellent',
  rate: 55,
  plan: '/hr',
  type: 'Sedan',
  availability: 1,
  location: 'KNUST',
  maxDuration: 5,
  description: "This is a really beautiful and strong car you're going to enjoy every moment in it",
  terms: 'You crash it, you buy it',
}

// Reservation
const reservationInput = {
  customer: {
    id: userPayload._id.toString(),
    name: userPayload.name,
  },
  renter: carPayload.owner,
  car: carPayload._id,
  startDate: new Date('01-05-2023').toISOString(),
  returnDate: new Date('10-05-2023').toISOString(),
  status: ReservationStatus.Pending,
}

const updateReservationInput = {
  customer: {
    id: userPayload._id.toString(),
    name: userPayload.name,
  },
  renter: carPayload.owner,
  car: carPayload._id,
  startDate: new Date('03-05-2023').toISOString(),
  returnDate: new Date('10-05-2023').toISOString(),
  status: ReservationStatus.Pending,
}

const reservationStatusInput = {
  status: ReservationStatus.Accepted,
}

const reservationInputOmitted = {
  customer: {
    id: userPayload._id,
    name: userPayload.name,
  },
  renter: carPayload.owner,
  startDate: new Date('01-05-2023').toISOString(),
  returnDate: new Date('10-05-2023').toISOString(),
  status: ReservationStatus.Pending,
}

const reservationPayload = {
  _id: userId.toString(),
  customer: {
    id: userPayload._id.toString(),
    name: userPayload.name,
  },
  renter: carPayload.owner.toString(),
  car: carPayload._id.toString(),
  startDate: new Date('01-05-2023').toISOString(),
  returnDate: new Date('10-05-2023').toISOString(),
  status: ReservationStatus.Pending,
}

const updateReservationPayload = {
  _id: userId.toString(),
  customer: {
    id: userPayload._id.toString(),
    name: userPayload.name,
  },
  renter: carPayload.owner.toString(),
  car: carPayload._id.toString(),
  startDate: new Date('03-05-2023').toISOString(),
  returnDate: new Date('10-05-2023').toISOString(),
  status: ReservationStatus.Pending,
}

export {
  userJwt,
  carInput,
  userInput,
  renterJwt,
  carPayload,
  renterInput,
  authPayload,
  authDetails,
  userPayload,
  invalidEmail,
  renterPayload,
  sessionPayload,
  updateCarInput,
  invalidPassword,
  carInputOmitted,
  updateCarPayload,
  reservationInput,
  renterAuthDetails,
  renterAuthPayload,
  updateUserPayload,
  reservationPayload,
  updateReservationInput,
  userPayloadWithSession,
  reservationStatusInput,
  reservationInputOmitted,
  renterPayloadWithSession,
  updateReservationPayload,
  userInputWithMissingFields,
  renterInputWithMissingFields,
}
