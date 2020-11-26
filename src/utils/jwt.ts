import jwt from 'jsonwebtoken'

export function generateAccessToken(user: { _id: string }): void {
  jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 86400,
  })
}

export function decodeToken(token: string): any {
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return {}
    return user
  })
}
