import { IPassportProvider } from '../../interfaces/config/passport/passport'

export const AMAZON = <IPassportProvider>{
  clientID: process.env.AMAZON_CLIENT_ID,
  clientSecret: process.env.AMAZON_CLIENT_SECRET,
}
export const GITHUB = <IPassportProvider>{
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
}
export const FACEBOOK = <IPassportProvider>{
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
}
export const GOOGLE = <IPassportProvider>{
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}
