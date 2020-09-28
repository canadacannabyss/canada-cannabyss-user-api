/* eslint-disable no-underscore-dangle */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const cookieSession = require('cookie-session');
const passport = require('passport');
const connectDB = require('./config/db');
const cookieKey = require('./config/cookies/keys');

const config = require('./config/config');

require('dotenv').config();
require('./config/passport')(passport);

console.log('NODE_ENV:', process.env.NODE_ENV);

// config variables
// eslint-disable-next-line no-unused-vars

const app = express();

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [cookieKey.session.cookieKey],
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: false,
  }),
);

// Express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    // store: new MongoStore({
    //   mongooseConnection: mongoose.connection,
    //   collection: 'sessions',
    // }),
  }),
);

// Switch file storage from development to production
app.use(morgan('dev'));
app.use(
  '/files',
  express.static(path.resolve(__dirname, '.', 'tmp', 'uploads')),
);

// Routes
app.use('/auth', require('./routes/auth/auth'));
app.use('/users', require('./routes/users'));
app.use('/resellers/auth', require('./routes/reseller/auth'));
app.use('/admin/auth', require('./routes/admin/auth'));
app.use('/admin/resellers', require('./routes/admin/resellers/resellers'));
app.use('/referral', require('./routes/referral/referral'));
app.use('/customers/auth', require('./routes/customers/auth'));
app.use('/resellers', require('./routes/reseller/index'));

connectDB();

const port = process.env.PORT || global.gConfig.node_port;

app.listen(port, () => {
  console.log(`${global.gConfig.app_name} is listening on port: ${port}`);
});
