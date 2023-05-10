import UserModel from '../models/user.mongo'

async function getRenterCars(userId: string) {
  const user = await UserModel.findOne({ _id: userId }).populate('cars')
  if (!user) throw new Error('')
  return user.cars
}

export { getRenterCars }
