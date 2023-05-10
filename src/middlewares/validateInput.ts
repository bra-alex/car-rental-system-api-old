import log from '../util/logger'
import { AnyZodObject } from 'zod'
import { NextFunction, Request, Response } from 'express'

const validateInput =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      return next()
    } catch (e: any) {
      log.error(e)
      return res.status(400).send(e.errors)
    }
  }

export default validateInput
