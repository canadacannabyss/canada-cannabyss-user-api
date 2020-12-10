import { NextFunction, Response, Request } from 'express'
import jwt from 'jsonwebtoken'

import Customer from '../../../models/customer/Customer'

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      req.headers.authorization === undefined ||
      req.headers.authorization === null
    ) {
      return res.status(401).json({
        error: ['Authorization token is required!'],
      })
    }

    const authorization = req.headers.authorization.split(' ')

    if (authorization.length !== 2 && authorization[0] !== 'Bearer') {
      return res.status(401).json({
        error: ['Authorization token is invalid!'],
      })
    }

    jwt.verify(
      authorization[1],
      process.env.ACCESS_TOKEN_SECRET,
      async (error, decoded: { id: string }) => {
        if (error) {
          return res.status(401).send({
            statusCode: 401,
            results: {},
            errors: [error],
          })
        }

        const tokenizedUser = await Customer.findOne({
          _id: decoded.id,
        })

        if (!tokenizedUser) {
          return res.status(401).send({
            statusCode: 401,
            results: {},
            errors: ['Invalid user.'],
          })
        }

        next()
      },
    )
  } catch (err) {
    return res.status(401).send({
      statusCode: 401,
      results: {},
      errors: [err.message],
    })
  }
}
