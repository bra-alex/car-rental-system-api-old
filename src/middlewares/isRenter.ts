import { NextFunction, Request, Response } from 'express'

import { Roles } from '../models/enums'

export default function isRenter(_req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user

  if (user.role !== Roles.Renter) return res.sendStatus(403)

  return next()
}
