import app from '../app'
import supertest from 'supertest'

describe('healthcare', () => {
  it('should always return 200', async () => {
    await supertest(app).get('/healthcare').expect(200)
  })
})
