import mongoose from 'mongoose'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'

import app from '../app'
import { signJWT } from '../util/jwt'
// import { Reservation } from '../models/dto/userInputs'
import * as ReservationService from '../services/reservation.service'
import {
  userJwt,
  renterJwt,
  reservationInput,
  reservationPayload,
  updateReservationInput,
  reservationStatusInput,
  reservationInputOmitted,
  updateReservationPayload,
} from '../models/tests'

describe('reservation', () => {
  const userId = new mongoose.Types.ObjectId().toString()
  jest.setTimeout(15000)

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('createReservation', () => {
    describe('given the user is not logged in', () => {
      it('should return a 403', async () => {
        await supertest(app).post('/reservations/').expect(403)
      })
    })

    describe('given the user is logged in', () => {
      const jwt = signJWT(userJwt)
      describe('given some data is omitted', () => {
        it('should return a 400', async () => {
          await supertest(app)
            .post('/reservations/')
            .set('Authorization', `Bearer ${jwt}`)
            .send(reservationInputOmitted)
            .expect(400)
        })
      })

      describe('given no data is omitted', () => {
        it('should return a 201 status and reservation payload', async () => {
          const createReservationServiceMock = jest
            .spyOn(ReservationService, 'createReservation')
            //   @ts-ignore
            .mockReturnValueOnce(reservationPayload)

          const { body } = await supertest(app)
            .post('/reservations/')
            .set('Authorization', `Bearer ${jwt}`)
            .send(reservationInput)
            .expect(201)

          expect(body).toEqual(reservationPayload)
          expect(createReservationServiceMock).toHaveBeenCalledWith(reservationInput)
        })
      })
    })
  })

  describe('update status', () => {
    describe('given the user is not logged in', () => {
      it('should return a 403', async () => {
        await supertest(app).patch(`/reservations/${userId}/status`).expect(403)
      })
    })

    describe('given the user is logged in', () => {
      const jwt = signJWT(userJwt)
      describe('given the reservation does not exist', () => {
        it('should return a 404', async () => {
          const updateReservationStatusMock = jest
            .spyOn(ReservationService, 'updateReservationStatus')
            // @ts-ignore
            .mockRejectedValueOnce('Not found')

          await supertest(app)
            .patch(`/reservations/${userId}/status`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(reservationStatusInput)
            .expect(404)

          expect(updateReservationStatusMock).toHaveBeenCalledWith({
            ...reservationStatusInput,
            filter: { _id: userId },
          })
        })
      })

      describe('given the reservation does exist', () => {
        it('should return a 200 status and reservation payload', async () => {
          const updateReservationStatusMock = jest
            .spyOn(ReservationService, 'updateReservationStatus')
            // @ts-ignore
            .mockReturnValueOnce({ ...reservationPayload, ...reservationStatusInput })

          const { body } = await supertest(app)
            .patch(`/reservations/${reservationPayload._id}/status`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(reservationStatusInput)
            .expect(200)

          expect(body).toEqual({ ...reservationPayload, ...reservationStatusInput })
          expect(updateReservationStatusMock).toHaveBeenCalledWith({
            ...reservationStatusInput,
            filter: { _id: reservationPayload._id },
          })
        })
      })
    })
  })

  describe('edit reservation', () => {
    describe('given the user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).patch(`/reservations/${userId}`).expect(403)
      })
    })

    describe('given the user is logged in', () => {
      const jwt = signJWT(userJwt)

      describe('given the reservation does not exist', () => {
        it('should return 404', async () => {
          const updateReservationServiceMock = jest
            .spyOn(ReservationService, 'updateReservation')
            // @ts-ignore
            .mockRejectedValueOnce('Does not exist')

          await supertest(app)
            .patch(`/reservations/${userId}`)
            .set('Authorization', jwt)
            .send(updateReservationInput)
            .expect(404)

          expect(updateReservationServiceMock).toHaveBeenCalledWith(
            { _id: userId },
            updateReservationInput,
            { new: true },
          )
        })
      })

      describe('given the reservation does exist', () => {
        describe('given some data is omitted', () => {
          it('should return 400', async () => {
            await supertest(app)
              .patch(`/reservations/${reservationPayload._id}`)
              .set('Authorization', jwt)
              .send(reservationInputOmitted)
              .expect(400)
          })
        })

        describe('given no data is omitted', () => {
          it('should return 200 and updated reservation', async () => {
            const updateReservationServiceMock = jest
              .spyOn(ReservationService, 'updateReservation')
              // @ts-ignore
              .mockReturnValueOnce(updateReservationPayload)

            const { body } = await supertest(app)
              .patch(`/reservations/${reservationPayload._id}`)
              .set('Authorization', jwt)
              .send(updateReservationInput)
              .expect(200)

            expect(body).toEqual(updateReservationPayload)
            expect(updateReservationServiceMock).toHaveBeenCalledWith(
              { _id: reservationPayload._id },
              updateReservationInput,
              { new: true },
            )
          })
        })
      })
    })
  })

  describe('delete reservation', () => {
    describe('given the user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).delete(`/reservations/${userId}`).expect(403)
      })
    })

    describe('given the user is logged in', () => {
      describe('given the user is not a renter', () => {
        const jwt = signJWT(userJwt)

        describe('given the reservation does not exist', () => {
          it('should return 404', async () => {
            const deleteReservationServiceMock = jest
              .spyOn(ReservationService, 'userDeleteReservation')
              // @ts-ignore
              .mockRejectedValueOnce('Does not exist')

            await supertest(app)
              .delete(`/reservations/${userId}`)
              .set('Authorization', jwt)
              .expect(404)

            expect(deleteReservationServiceMock).toHaveBeenCalledWith(
              userId,
              userJwt._id.toString(),
            )
          })
        })

        describe('given the reservation does exist', () => {
          it('should return 200 and updated reservation', async () => {
            const deleteReservationServiceMock = jest
              .spyOn(ReservationService, 'userDeleteReservation')
              // @ts-ignore
              .mockReturnValueOnce({ acknowledged: true, deletedCount: 0 })

            await supertest(app)
              .delete(`/reservations/${reservationPayload._id}`)
              .set('Authorization', jwt)
              .expect(200)

            expect(deleteReservationServiceMock).toHaveBeenCalledWith(
              reservationPayload._id,
              userJwt._id.toString(),
            )
          })
        })
      })

      describe('given the user is a renter', () => {
        const jwt = signJWT(renterJwt)

        describe('given the reservation does not exist', () => {
          it('should return 404', async () => {
            const deleteReservationServiceMock = jest
              .spyOn(ReservationService, 'renterDeleteReservation')
              // @ts-ignore
              .mockRejectedValueOnce('Does not exist')

            await supertest(app)
              .delete(`/reservations/${userId}`)
              .set('Authorization', jwt)
              .expect(404)

            expect(deleteReservationServiceMock).toHaveBeenCalledWith(userId)
          })
        })

        describe('given the reservation does exist', () => {
          it('should return 200 and updated reservation', async () => {
            const deleteReservationServiceMock = jest
              .spyOn(ReservationService, 'renterDeleteReservation')
              // @ts-ignore
              .mockReturnValueOnce({ acknowledged: true, deletedCount: 0 })

            await supertest(app)
              .delete(`/reservations/${reservationPayload._id}`)
              .set('Authorization', jwt)
              .expect(200)

            expect(deleteReservationServiceMock).toHaveBeenCalledWith(reservationPayload._id)
          })
        })
      })
    })
  })
})
