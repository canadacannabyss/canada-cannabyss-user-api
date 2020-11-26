const slugify = require('slugify')
const User = require('../models/user/User')
const { getRandomInt } = require('./number')

export async function checkExistingUsername(
  username: string,
): Promise<boolean> {
  const res = await User.find({
    username,
  })

  return res.length > 0
}

export function createUsername(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`.toLowerCase()
}

export function createUniqueUsername(
  firstName: string,
  lastName: string,
): string {
  return `${firstName}-${lastName}-${getRandomInt(0, 10000)}`.toLowerCase()
}

export function splitIntoFirstAndLastNames(name: string): string[] {
  return name.split(' ')
}

export function slugifyUsername(username: string): string {
  return slugify(username)
}
