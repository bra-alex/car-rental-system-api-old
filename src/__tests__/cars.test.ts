import mongoose from 'mongoose'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'

import app from '../app'
import { signJWT } from '../util/jwt'
import { Car, User } from '../models/dto/userInputs'
import * as CarService from '../services/car.service'
import * as UserService from '../services/user.service'
import {
  userJwt,
  carInput,
  renterJwt,
  carPayload,
  renterInput,
  renterPayload,
  updateCarInput,
  carInputOmitted,
  updateCarPayload,
  reservationPayload,
} from '../models/tests'

describe('cars', () => {
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

  describe('get available cars', () => {
    describe('given user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).get(`/cars/available`).expect(403)
      })
    })

    describe('given user is logged in', () => {
      const jwt = signJWT(userJwt)

      describe('given there are no available cars', () => {
        it('should return 200 and an empty array', async () => {
          const { body } = await supertest(app)
            .get(`/cars/available`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(200)
          expect(body).toEqual([])
        })
      })

      describe('given there are available cars', () => {
        it('should return 200 and an array of cars', async () => {
          const renter = await UserService.createUser({
            ...renterInput,
            dob: new Date(renterInput.dob),
          } as unknown as User)
          await CarService.addCar({
            carDetails: { ...carPayload, owner: renter._id } as Car,
            userId: renter._id,
          })
          const { body } = await supertest(app)
            .get(`/cars/available`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(200)
          expect(body).toEqual([expect.any(Object)])
        })
      })
    })
  })

  describe('create car', () => {
    describe('given user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).post(`/cars/`).expect(403)
      })
    })

    describe('given user is logged in', () => {
      describe('given user is not a renter', () => {
        const jwt = signJWT(userJwt)

        it('should return 403', async () => {
          await supertest(app).post(`/cars/`).set('Authorization', `Bearer ${jwt}`).expect(403)
        })
      })

      describe('given user is a renter', () => {
        const jwt = signJWT(renterJwt)

        describe('given car data is omitted', () => {
          it('should return 400', async () => {
            await supertest(app)
              .post(`/cars/`)
              .set('Authorization', `Bearer ${jwt}`)
              .send(carInputOmitted)
              .expect(400)
          })
        })

        describe('given car data is not omitted', () => {
          describe('given that there is no error', () => {
            it('should return 201 status with car object', async () => {
              const addCarServiceMock = jest
                .spyOn(CarService, 'addCar')
                //   @ts-ignore
                .mockReturnValueOnce(carPayload)

              const { body } = await supertest(app)
                .post(`/cars/`)
                .set('Authorization', `Bearer ${jwt}`)
                .send(carInput)
                .expect(201)

              expect(body).toEqual(carPayload)

              expect(addCarServiceMock).toHaveBeenCalledWith({
                carDetails: carInput,
                userId: carInput.owner,
              })
            })
          })

          describe('given that there is an error', () => {
            describe('given the user is not owner', () => {
              it('should return 400', async () => {
                const addCarServiceMock = jest
                  .spyOn(CarService, 'addCar')
                  //   @ts-ignore
                  .mockReturnValueOnce(carPayload)

                await supertest(app)
                  .post(`/cars/`)
                  .set('Authorization', `Bearer ${jwt}`)
                  .send({ ...carInput, owner: userId })
                  .expect(400)

                expect(addCarServiceMock).not.toHaveBeenCalled()
              })
            })

            describe('given the user is the owner', () => {
              it('should return 400', async () => {
                const addCarServiceMock = jest
                  .spyOn(CarService, 'addCar')
                  //   @ts-ignore
                  .mockRejectedValueOnce('Car not created')

                await supertest(app)
                  .post(`/cars/`)
                  .set('Authorization', `Bearer ${jwt}`)
                  .send(carInput)
                  .expect(400)

                expect(addCarServiceMock).toHaveBeenCalledWith({
                  carDetails: carInput,
                  userId: renterPayload._id.toString(),
                })
              })
            })
          })
        })
      })
    })
  })

  describe('update car', () => {
    describe('given user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).patch(`/cars/${carPayload._id}`).expect(403)
      })
    })

    describe('given user is logged in', () => {
      describe('given user is not a renter', () => {
        const jwt = signJWT(userJwt)

        it('should return 403', async () => {
          await supertest(app)
            .patch(`/cars/${carPayload._id}`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(403)
        })
      })

      describe('given user is a renter', () => {
        const jwt = signJWT(renterJwt)

        describe('given car data is omitted', () => {
          it('should return 400', async () => {
            await supertest(app)
              .patch(`/cars/${carPayload._id}`)
              .set('Authorization', `Bearer ${jwt}`)
              .send(carInputOmitted)
              .expect(400)
          })
        })

        describe('given car data is not omitted', () => {
          describe('given the renter is not the owner', () => {
            it('should return a 403', async () => {
              await supertest(app)
                .patch(`/cars/${carPayload._id}`)
                .set('Authorization', `Bearer ${jwt}`)
                .send({ ...carInput, owner: userId })
                .expect(403)
            })
          })

          describe('given the renter is the owner', () => {
            it('should return 200 status with car object', async () => {
              const updateCarServiceMock = jest
                .spyOn(CarService, 'updateCar')
                //   @ts-ignore
                .mockReturnValueOnce(updateCarPayload)

              const { body } = await supertest(app)
                .patch(`/cars/${carPayload._id}`)
                .set('Authorization', `Bearer ${jwt}`)
                .send(updateCarInput)
                .expect(200)

              expect(body).toEqual(updateCarPayload)

              expect(updateCarServiceMock).toHaveBeenCalledWith(
                { _id: carPayload._id },
                updateCarInput,
                { new: true },
              )
            })
          })
        })
      })
    })
  })

  describe('delete car', () => {
    describe('given user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).delete(`/cars/${carPayload._id}`).expect(403)
      })
    })

    describe('given user is logged in', () => {
      describe('given user is not a renter', () => {
        const jwt = signJWT(userJwt)

        it('should return 403', async () => {
          await supertest(app)
            .delete(`/cars/${carPayload._id}`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(403)
        })
      })

      describe('given user is a renter', () => {
        const jwt = signJWT(renterJwt)

        describe('given the car does not exist', () => {
          it('should return 404', async () => {
            const findCarServiceMock = jest
              .spyOn(CarService, 'findCar')
              // @ts-ignore
              .mockReturnValueOnce(undefined)

            await supertest(app)
              .delete(`/cars/${userId}`)
              .set('Authorization', `Bearer ${jwt}`)
              .expect(404)

            expect(findCarServiceMock).toHaveBeenCalledWith({
              _id: userId,
              owner: renterJwt._id.toString(),
            })
          })
        })

        describe('given the car exists', () => {
          describe('given renter is not the owner', () => {
            it('should return 404', async () => {
              const fakeRenter = await UserService.createUser({
                ...renterInput,
                email: 'example@example.com',
                phoneNumber: '00200215232',
                cars: [],
              } as unknown as User)

              const findCarServiceMock = jest
                .spyOn(CarService, 'findCar')
                // @ts-ignore
                .mockReturnValueOnce(undefined)

              const findOwnerServiceMock = jest
                .spyOn(UserService, 'findUser')
                // @ts-ignore
                .mockReturnValueOnce(fakeRenter)

              const deleteCarServiceMock = jest
                .spyOn(CarService, 'deleteCar')
                // @ts-ignore
                .mockReturnValueOnce({ acknowledged: true, deletedCount: 0 })

              await supertest(app)
                .delete(`/cars/${carPayload._id}`)
                .set('Authorization', `Bearer ${jwt}`)
                .expect(404)

              expect(findCarServiceMock).toHaveBeenCalledWith({
                _id: carPayload._id,
                owner: renterJwt._id.toString(),
              })
              expect(findOwnerServiceMock).not.toHaveBeenCalledWith({ _id: fakeRenter._id })
              expect(deleteCarServiceMock).not.toHaveBeenCalled()
            })
          })

          describe('given owner does not exist', () => {
            it('should return 404', async () => {
              const findCarServiceMock = jest
                .spyOn(CarService, 'findCar')
                // @ts-ignore
                .mockReturnValueOnce({ ...carPayload, owner: userId })

              const findOwnerServiceMock = jest
                .spyOn(UserService, 'findUser')
                // @ts-ignore
                .mockReturnValueOnce(undefined)

              const deleteCarServiceMock = jest
                .spyOn(CarService, 'deleteCar')
                // @ts-ignore
                .mockReturnValueOnce({ acknowledged: true, deletedCount: 0 })

              await supertest(app)
                .delete(`/cars/${carPayload._id}`)
                .set('Authorization', `Bearer ${jwt}`)
                .expect(404)

              expect(findCarServiceMock).toHaveBeenCalledWith({
                _id: carPayload._id,
                owner: carPayload.owner,
              })
              expect(findOwnerServiceMock).toHaveBeenCalledWith({ _id: userId })
              expect(deleteCarServiceMock).not.toHaveBeenCalled()
            })
          })

          describe('given renter is the owner', () => {
            describe('given there are any errors', () => {
              it('should return 400', async () => {
                const findCarServiceMock = jest
                  .spyOn(CarService, 'findCar')
                  // @ts-ignore
                  .mockReturnValueOnce(carPayload)

                const findOwnerServiceMock = jest
                  .spyOn(UserService, 'findUser')
                  // @ts-ignore
                  .mockReturnValueOnce(renterPayload)

                const deleteCarServiceMock = jest
                  .spyOn(CarService, 'deleteCar')
                  // @ts-ignore
                  .mockReturnValueOnce({ acknowledged: true, deletedCount: 0 })

                await supertest(app)
                  .delete(`/cars/${carPayload._id}`)
                  .set('Authorization', `Bearer ${jwt}`)
                  .expect(400)

                expect(findCarServiceMock).toHaveBeenCalledWith({
                  _id: carPayload._id,
                  owner: carPayload.owner,
                })
                expect(findOwnerServiceMock).toHaveBeenCalledWith({ _id: carPayload.owner })
                expect(deleteCarServiceMock).toHaveBeenCalledWith({ _id: carPayload._id })
              })
            })

            describe('given there are no errors', () => {
              it('should return 200', async () => {
                const renter = renterPayload as unknown as User

                const findCarServiceMock = jest
                  .spyOn(CarService, 'findCar')
                  // @ts-ignore
                  .mockReturnValueOnce(carPayload)

                const findOwnerServiceMock = jest
                  .spyOn(UserService, 'findUser')
                  // @ts-ignore
                  .mockReturnValueOnce(renterPayload)

                const deleteCarServiceMock = jest
                  .spyOn(CarService, 'deleteCar')
                  // @ts-ignore
                  .mockReturnValueOnce({ acknowledged: true, deletedCount: 0 })

                renter.removeCar = jest.fn().mockReturnValueOnce(renter)

                await supertest(app)
                  .delete(`/cars/${carPayload._id}`)
                  .set('Authorization', `Bearer ${jwt}`)
                  .expect(200)

                expect(findCarServiceMock).toHaveBeenCalledWith({
                  _id: carPayload._id,
                  owner: carPayload.owner,
                })
                expect(findOwnerServiceMock).toHaveBeenCalledWith({ _id: carPayload.owner })
                expect(deleteCarServiceMock).toHaveBeenCalledWith({ _id: carPayload._id })
                expect(renter.removeCar).toHaveBeenCalledWith(carPayload._id)
              })
            })
          })
        })
      })
    })
  })

  describe('view rental history', () => {
    describe('given user is not logged in', () => {
      it('should return 403', async () => {
        await supertest(app).get(`/cars/${userId}/history`).expect(403)
      })
    })

    describe('given user is logged in', () => {
      describe('given user is not a renter', () => {
        const jwt = signJWT(userJwt)

        it('should return 403', async () => {
          await supertest(app)
            .get(`/cars/${userId}/history`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(403)
        })
      })

      describe('given user is a renter', () => {
        const jwt = signJWT(renterJwt)

        describe('given the car does not exist', () => {
          it('should return 404', async () => {
            const findCarServiceMock = jest
              .spyOn(CarService, 'findCar')
              // @ts-ignore
              .mockReturnValueOnce(undefined)

            const getCarHistoryServiceMock = jest
              .spyOn(CarService, 'getCarHistory')
              // @ts-ignore
              .mockReturnValueOnce(undefined)

            await supertest(app)
              .get(`/cars/${userId}/history`)
              .set('Authorization', `Bearer ${jwt}`)
              .expect(404)

            expect(findCarServiceMock).toHaveBeenCalledWith({ _id: userId })
            expect(getCarHistoryServiceMock).not.toHaveBeenCalled()
          })
        })

        describe('given the car exists', () => {
          describe('given the renter is the owner', () => {
            it('should return 200', async () => {
              const findCarServiceMock = jest
                .spyOn(CarService, 'findCar')
                // @ts-ignore
                .mockReturnValueOnce(carPayload)

              const getCarHistoryServiceMock = jest
                .spyOn(CarService, 'getCarHistory')
                // @ts-ignore
                .mockReturnValueOnce([{ ...reservationPayload }])

              const { body } = await supertest(app)
                .get(`/cars/${carPayload._id}/history`)
                .set('Authorization', `Bearer ${jwt}`)
                .expect(200)

              expect(body).toEqual([reservationPayload])
              expect(findCarServiceMock).toHaveBeenCalledWith({ _id: carPayload._id })
              expect(getCarHistoryServiceMock).toHaveBeenCalledWith({
                _id: carPayload._id,
                owner: carPayload.owner,
              })
            })
          })

          describe('given the renter is not the owner', () => {
            it('should return 404', async () => {
              const findCarServiceMock = jest
                .spyOn(CarService, 'findCar')
                // @ts-ignore
                .mockReturnValueOnce(carPayload)

              const getCarHistoryServiceMock = jest
                .spyOn(CarService, 'getCarHistory')
                // @ts-ignore
                .mockReturnValueOnce(undefined)

              await supertest(app)
                .get(`/cars/${carPayload._id}/history`)
                .set('Authorization', `Bearer ${jwt}`)
                .expect(404)

              expect(findCarServiceMock).toHaveBeenCalledWith({ _id: carPayload._id })
              expect(getCarHistoryServiceMock).toHaveBeenCalledWith({
                _id: carPayload._id,
                owner: carPayload.owner,
              })
            })
          })
        })
      })
    })
  })
})
