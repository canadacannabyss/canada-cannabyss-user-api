import slugify from 'slugify'
import { v4 } from 'uuid'

export function slugifyString(string: string): string {
  return slugify(string).toLowerCase()
}

export function generateRandomSlug(slug: string): string {
  const random = v4()
  let finalUuid = ''
  random.split('-').map((string) => {
    finalUuid += string[0]
  })
  return `${slug}-${finalUuid}`
}

export function slugifyUsername(username: string): string {
  return slugify(username)
}
