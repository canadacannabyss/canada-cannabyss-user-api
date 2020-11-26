import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): any {
  const authHeader = req.headers.authorization
  const bearer = authHeader && authHeader.split(' ')[0]
  const token = authHeader && authHeader.split(' ')[1]
  if (bearer === null || bearer !== 'Bearer') return res.sendStatus(401)
  if (token === null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}
