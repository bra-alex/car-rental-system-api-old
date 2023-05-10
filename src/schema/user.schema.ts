import { TypeOf, array, coerce, nativeEnum, object, optional, string } from 'zod'

import { Roles } from '../models/enums'

const authSchema = {
  body: object({
    email: string({
      required_error: 'Please enter a valid email address',
    }).email('Invalid email address'),
    password: string({
      required_error: 'Please enter a password',
    }).min(5, 'Password must be at least 5 characters long'),
  }),
}

const userSchema = {
  body: object({
    userId: string({
      required_error: 'UserId is required',
    }),
    name: string({
      required_error: 'Name is required',
    }),
    email: string({
      required_error: 'Please enter a valid email address',
    }).email('Invalid email address'),
    dob: coerce.date({
      required_error: 'Date of birth is required',
    }),
    phoneNumber: string({
      required_error: 'Phone number required',
    }),
    profilePicture: string().optional(),
    placeOfResidence: object({
      lat: string(),
      long: string(),
    }).optional(),
    role: nativeEnum(Roles).optional(),
    identificationCard: string().optional(),
    reservations: optional(array(string())),
    cars: array(string()).optional(),
  }),
}

const params = {
  params: object({
    userId: string({
      required_error: 'User id required',
    }),
  }),
}

const createUserSchema = object({
  ...authSchema,
  ...userSchema,
})

const loginSchema = object({
  ...authSchema,
})

const updateUserSchema = object({
  ...params,
  ...userSchema,
})

const upgradeUserSchema = object({
  ...params,
})

const deleteUserSchema = object({
  ...params,
})

const getUserSchema = object({
  ...params,
})

const getUserReservationHistorySchema = object({
  ...params,
})

const clearUserReservationHistorySchema = object({
  ...params,
})

type LoginInput = TypeOf<typeof loginSchema>
type GetUserInput = TypeOf<typeof getUserSchema>
type CreateUserInput = TypeOf<typeof createUserSchema>
type UpdateUserInput = TypeOf<typeof updateUserSchema>
type DeleteUserInput = TypeOf<typeof deleteUserSchema>
type UpgradeUserInput = TypeOf<typeof upgradeUserSchema>
type GetUserReservationHistoryInput = TypeOf<typeof getUserReservationHistorySchema>
type ClearUserReservationHistoryInput = TypeOf<typeof clearUserReservationHistorySchema>

export {
  loginSchema,
  getUserSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  upgradeUserSchema,
  getUserReservationHistorySchema,
  clearUserReservationHistorySchema,
  LoginInput,
  GetUserInput,
  CreateUserInput,
  UpdateUserInput,
  DeleteUserInput,
  UpgradeUserInput,
  GetUserReservationHistoryInput,
  ClearUserReservationHistoryInput,
}
