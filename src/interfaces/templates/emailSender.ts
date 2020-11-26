export interface IOrder {
  _id: string
  tracking: {
    number: string
    postalService: {
      name: string
      trackingWebsite: string
    }
  }
}
