export interface IOrder {
  _id: string
  tracking: {
    number: string
    postalService: {
      name: string
      trackingWebsite: string
    }
  }
  customer: {
    email: string
  }
}

export interface ITransporterConfig {
  host: string
  port: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}
