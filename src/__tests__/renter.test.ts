import mongoose from 'mongoose'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'

import app from '../app'
import { signJWT } from '../util/jwt'
import { addCar } from '../services/car.service'
import { Car, User } from '../models/dto/userInputs'
import * as UserService from '../services/user.service'
import * as AuthService from '../services/auth.service'
import * as RenterService from '../services/renter.service'
import * as SessionService from '../services/session.service'
import {
  renterJwt,
  carPayload,
  renterInput,
  renterPayload,
  sessionPayload,
  renterAuthDetails,
  renterAuthPayload,
  renterPayloadWithSession,
  renterInputWithMissingFields,
} from '../models/tests'

describe('renter', () => {
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

  describe('get renter cars', () => {
    describe('given user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).get(`/renters/${userId}/cars`).expect(403)
      })
    })

    describe('given user is logged in', () => {
      const jwt = signJWT(renterJwt)
      describe('given renter does not exist', () => {
        it('should return 404', async () => {
          await supertest(app)
            .get(`/renters/${userId}/cars`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(404)
        })
      })

      describe('given the renter exists', () => {
        describe('given the renter has no cars', () => {
          it('should return 200 status and an empty array', async () => {
            const getRenterCarsServiceMock = jest
              .spyOn(RenterService, 'getRenterCars')
              // @ts-ignore
              .mockReturnValueOnce([])

            const renter = await UserService.createUser({
              ...renterInput,
              dob: new Date(renterInput.dob),
            } as unknown as User)

            userId = renter._id

            const { body } = await supertest(app)
              .get(`/renters/${renter._id}/cars`)
              .set('Authorization', `Bearer ${jwt}`)
              .expect(200)

            expect(body).toEqual([])
            expect(getRenterCarsServiceMock).toHaveBeenCalledWith(renter._id.toString())
          })
        })

        describe('given the renter has cars', () => {
          it('should return 200 status and cars array', async () => {
            const getRenterCarsServiceMock = jest
              .spyOn(RenterService, 'getRenterCars')
              //   @ts-ignore
              .mockReturnValueOnce([expect.any(Object)])

            await addCar({
              carDetails: { ...carPayload, owner: userId } as Car,
              userId,
            })

            const { body } = await supertest(app)
              .get(`/renters/${userId}/cars`)
              .set('Authorization', `Bearer ${jwt}`)
              .expect(200)

            expect(body).toEqual([expect.any(Object)])
            expect(getRenterCarsServiceMock).toHaveBeenCalledWith(userId.toString())
          })
        })
      })
    })
  })

  describe('create renter', () => {
    describe('given all data is given', () => {
      it('should return a 201 status and sessionId, refreshToken and accessToken', async () => {
        const createAuthServiceMock = jest
          .spyOn(AuthService, 'createAuth')
          // @ts-ignore
          .mockReturnValueOnce(renterAuthPayload)

        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          // @ts-ignore
          .mockReturnValueOnce(renterPayload)

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        const { body, statusCode } = await supertest(app).post('/renters/').send(renterInput)

        expect(statusCode).toBe(201)
        expect(body).toEqual(renterPayloadWithSession)

        expect(createAuthServiceMock).toBeCalledWith(renterAuthDetails)
        expect(createUserServiceMock).toHaveBeenCalledWith(renterInput)
        expect(createSessionServiceMock).toHaveBeenCalledWith(renterPayload._id, renterPayload)
      })
    })

    describe('given some data is omitted', () => {
      it('should return 400', async () => {
        const createAuthServiceMock = jest
          .spyOn(AuthService, 'createAuth')
          // @ts-ignore
          .mockReturnValueOnce(renterAuthPayload)

        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          //  @ts-ignore
          .mockReturnValueOnce(renterPayload)

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        await supertest(app).post('/renters/').send(renterInputWithMissingFields).expect(400)

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
          .mockReturnValueOnce(renterPayload)

        const createSessionServiceMock = jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValueOnce(sessionPayload)

        await supertest(app).post('/renters/').send(renterInput).expect(409)

        expect(createAuthServiceMock).toHaveBeenCalledWith(renterAuthDetails)
        expect(createUserServiceMock).not.toHaveBeenCalled()
        expect(createSessionServiceMock).not.toHaveBeenCalled()
      })
    })
  })
})
