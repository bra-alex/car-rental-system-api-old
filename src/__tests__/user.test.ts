import mongoose from 'mongoose'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'

import app from '../app'
import { signJWT } from '../util/jwt'
import { User } from '../models/dto/userInputs'
import { createUser } from '../services/user.service'
import * as UserService from '../services/user.service'
import * as AuthService from '../services/auth.service'
import * as SessionService from '../services/session.service'
import {
  userJwt,
  userInput,
  authDetails,
  userPayload,
  authPayload,
  invalidEmail,
  sessionPayload,
  invalidPassword,
  updateUserPayload,
  userPayloadWithSession,
  userInputWithMissingFields,
} from '../models/tests'

describe('user', () => {
  let userId = new mongoose.Types.ObjectId().toString()
  jest.setTimeout(15000)

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('get user', () => {
    describe('given the user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).get(`/users/${userId}`).expect(403)
      })
    })

    describe('given the user is logged in', () => {
      const jwt = signJWT(userJwt)

      describe('given the user does not exist', () => {
        it('should return 404', async () => {
          await supertest(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(404)
        })
      })

      describe('given the user does exist', () => {
        it('should return a 200 status with the userDetails', async () => {
          const user = await createUser({ ...userPayload, dob: new Date(userPayload.dob) } as User)
          userId = user._id
          const findUserServiceMock = jest
            .spyOn(UserService, 'findUser')
            // @ts-ignore
            .mockReturnValueOnce({ ...user, _id: user._id.toString() })

          const { body } = await supertest(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(200)

          expect(body).toEqual({ ...user, dob: user.dob.toISOString(), _id: user._id.toString() })
          expect(findUserServiceMock).toHaveBeenCalledWith({ _id: userId.toString() })
        })
      })
    })
  })

  describe('create User', () => {
    describe('given all data is given', () => {
      it('should return a 201 status and sessionId, refreshToken and accessToken', async () => {
        const createAuthServiceMock = jest
          .spyOn(AuthService, 'createAuth')
          // @ts-ignore
          .mockReturnValueOnce(authPayload)

        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          // @ts-ignore
          .mockReturnValueOnce(userPayload)

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        const { body, statusCode } = await supertest(app).post('/users/').send(userInput)

        expect(statusCode).toBe(201)
        expect(body).toEqual(userPayloadWithSession)

        expect(createAuthServiceMock).toBeCalledWith(authDetails)
        expect(createUserServiceMock).toHaveBeenCalledWith(userInput)
        expect(createSessionServiceMock).toHaveBeenCalledWith(userPayload._id, userPayload)
      })
    })

    describe('given some data is omitted', () => {
      it('should return 400', async () => {
        const createAuthServiceMock = jest
          .spyOn(AuthService, 'createAuth')
          // @ts-ignore
          .mockReturnValueOnce(authPayload)

        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          //  @ts-ignore
          .mockReturnValueOnce(userPayload)

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        await supertest(app).post('/users/').send(userInputWithMissingFields).expect(400)

        expect(createAuthServiceMock).not.toHaveBeenCalled()
        expect(createUserServiceMock).not.toHaveBeenCalled()
        expect(createSessionServiceMock).not.toHaveBeenCalled()
      })
    })

    describe('given some data is duplicated', () => {
      it('should return 409', async () => {
        const createAuthServiceMock = jest
          .spyOn(AuthService, 'createAuth')
          // @ts-ignore
          .mockRejectedValueOnce('Duplicate found')

        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          //  @ts-ignore
          .mockReturnValueOnce(userPayload)

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        await supertest(app).post('/users/').send(userInput).expect(409)

        expect(createAuthServiceMock).toHaveBeenCalledWith(authDetails)
        expect(createUserServiceMock).not.toHaveBeenCalled()
        expect(createSessionServiceMock).not.toHaveBeenCalled()
      })
    })
  })

  describe('login', () => {
    describe('given email does not exist', () => {
      it('should return a 404', async () => {
        const loginMock = jest
          .spyOn(AuthService, 'login')
          // @ts-ignore
          .mockRejectedValueOnce('Incorrect email or password')

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        await supertest(app).post('/users/login').send(invalidEmail).expect(404)

        expect(loginMock).toBeCalledWith(invalidEmail)
        expect(createSessionServiceMock).not.toHaveBeenCalled()
      })
    })

    describe('given email does exist and password is wrong', () => {
      it('should return a 404', async () => {
        const loginMock = jest
          .spyOn(AuthService, 'login')
          // @ts-ignore
          .mockRejectedValueOnce('Incorrect email or password')

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        await supertest(app).post('/users/login').send(invalidPassword).expect(404)

        expect(loginMock).toBeCalledWith(invalidPassword)
        expect(createSessionServiceMock).not.toHaveBeenCalled()
      })
    })

    describe('given email does exist and password is correct', () => {
      it('should return a 200 status and sessionId, refreshToken and accessToken', async () => {
        const loginMock = jest
          .spyOn(AuthService, 'login')
          // @ts-ignore
          .mockReturnValueOnce(userPayload)

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        const { body, statusCode } = await supertest(app).post('/users/login').send(authDetails)

        expect(statusCode).toBe(200)
        expect(body).toEqual(userPayloadWithSession)

        expect(loginMock).toBeCalledWith(authDetails)
        expect(createSessionServiceMock).toHaveBeenCalledWith(userPayload._id, userPayload)
      })
    })
  })

  describe('logout', () => {
    describe('given the user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).post(`/users/logout`).expect(403)
      })
    })

    describe('given the user is logged in', () => {
      it('should return a 200', async () => {
        const jwt = signJWT(userJwt)

        const logoutServiceMock = jest
          .spyOn(AuthService, 'logout')
          // @ts-ignore
          .mockReturnValueOnce({ acknowledged: true, deletedCount: 0 })

        await supertest(app).post('/users/logout').set('Authorization', `Bearer ${jwt}`).expect(200)

        expect(logoutServiceMock).toHaveBeenCalledWith(userJwt.session)
      })
    })
  })

  describe('update user details', () => {
    describe('given the user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).patch(`/users/${userId}`).expect(403)
      })
    })

    describe('given the user is logged in', () => {
      const jwt = signJWT(userJwt)

      describe('given the user is not authorized', () => {
        it('should return a 403', async () => {
          userId = new mongoose.Types.ObjectId().toString()
          await supertest(app)
            .patch(`/users/${userId}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(userPayload)
            .expect(403)
        })
      })

      describe('given the user is authorized', () => {
        describe('given the some data is omitted', () => {
          it('should return 400', async () => {
            await supertest(app)
              .patch(`/users/${userPayload._id}`)
              .set('Authorization', `Bearer ${jwt}`)
              .send(userInputWithMissingFields)
              .expect(400)
          })
        })

        describe('given no data is omitted', () => {
          it('should return a 200', async () => {
            const updateUserServiceMock = jest
              .spyOn(UserService, 'updateUser')
              // @ts-ignore
              .mockReturnValueOnce(updateUserPayload)

            const { body } = await supertest(app)
              .patch(`/users/${userPayload._id}`)
              .set('Authorization', `Bearer ${jwt}`)
              .send(updateUserPayload)
              .expect(200)

            expect(body).toEqual(updateUserPayload)

            expect(updateUserServiceMock).toHaveBeenCalledWith(
              { _id: updateUserPayload._id },
              updateUserPayload,
              { new: true },
            )
          })
        })
      })
    })
  })

  describe('delete user details', () => {
    describe('given the user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).delete(`/users/${userId}`).expect(403)
      })
    })

    describe('given the user is logged in', () => {
      const jwt = signJWT(userJwt)

      describe('user is not authorized', () => {
        it('should return a 403', async () => {
          userId = new mongoose.Types.ObjectId().toString()
          await supertest(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(403)
        })
      })

      describe('user is authorized', () => {
        it('should return a 200', async () => {
          const deleteUserServiceMock = jest
            .spyOn(UserService, 'deleteUser')
            // @ts-ignore
            .mockReturnValueOnce({ acknowledged: true, deletedCount: 0 })

          await supertest(app)
            .delete(`/users/${userJwt._id}`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(200)

          expect(deleteUserServiceMock).toHaveBeenCalledWith(
            { _id: userJwt._id.toString() },
            userJwt.session,
          )
        })
      })
    })
  })
})
