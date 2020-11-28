import jwt from 'jsonwebtoken'

export function generateAccessToken(userId: string): any {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 86400,
  })
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET)
}

export function decodeToken(token: string): any {
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return {}
    return user
  })
}
