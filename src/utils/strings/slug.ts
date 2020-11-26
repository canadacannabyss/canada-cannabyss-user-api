import slugify from 'slugify'
import uuid from 'uuid'

export function slugifyString(string: string): string {
  return slugify(string).toLowerCase()
}

export function generateRandomSlug(slug: string): string {
  const id = uuid.v4()
  const generatedNewSlug = `${slug}-${id}`
  return generatedNewSlug
}

export function slugifyUsername(username: string): string {
  return slugify(username)
}
