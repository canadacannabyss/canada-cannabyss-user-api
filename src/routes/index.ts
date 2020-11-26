import { Application } from 'express'

import auth from './auth/auth'
import users from './users'

import resellers from './reseller/index'
import resellerAuth from './reseller/auth'
import resellerCustomers from './reseller/customers/customers'

import adminAuth from './admin/auth'
import adminResellers from './admin/resellers/resellers'
import adminCustomer from './admin/customers/customers'

import customerAuth from './customers/auth'
import customers from './customers/customers'

import referral from './referral/referral'

export default (app: Application): void => {
  app.use('/auth', auth)
  app.use('/users', users)

  app.use('/resellers', resellers)
  app.use('/resellers/auth', resellerAuth)
  app.use('/reseller/customers', resellerCustomers)

  app.use('/admin/auth', adminAuth)
  app.use('/admin/resellers', adminResellers)
  app.use('/admin/customers', adminCustomer)

  app.use('/customers/auth', customerAuth)
  app.use('/customers', customers)

  app.use('/referral', referral)
}
