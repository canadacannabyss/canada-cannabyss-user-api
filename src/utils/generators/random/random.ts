/* eslint-disable no-undef */
import { v4 } from 'uuid'
import crypto from 'crypto'

export function generateRandomUsername(username: string): string {
  const random = v4()

  let finalUuid = ''
  random.split('-').map((string: string) => {
    finalUuid += string[0]
  })
  return `${username}-${finalUuid}`
}

export function generateUniqueId(
  numberOfBytes: number,
  encode: BufferEncoding,
  subEncode: number = 36,
): string {
  return crypto.randomBytes(numberOfBytes).toString(encode).toString(subEncode)
}
