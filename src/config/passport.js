/* eslint-disable no-underscore-dangle */
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user/User');
const UserProfileImage = require('../models/user/UserProfileImage');
const {
  createUsername,
  createUniqueUsername,
  checkExistingUsername,
  splitIntoFirstAndLstNames,
} = require('../utils/user');

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: 'This email is not register' });
          }

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            }
            return done(null, false, { message: 'Password is incorrect' });
          });
        })
        .catch((err) => {
          console.error(err);
        });
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            email: profile._json.email,
          });

          if (user) {
            done(null, user);
          } else {
            const fullName = splitIntoFirstAndLstNames(profile._json.name);
            let tempUsername = createUsername(fullName[0], fullName[1]);

            while (true) {
              if (!checkExistingUsername(tempUsername)) {
                break;
              }
              tempUsername = createUniqueUsername(fullName[0], fullName[1]);
            }

            const profileImage = await UserProfileImage.findOne({
              id: profile.id,
            });

            let profileImageObj = {};
            if (profileImage) {
              profileImageObj = profileImage;
            } else {
              const profileImageTemp = {
                id: profile.id,
                name: `${fullName[0]} profile`,
                url: profile.photos[0].value,
                origin: 'Facebook',
              };
              profileImageObj = await UserProfileImage.create(profileImageTemp);
            }

            const newUser = {
              id: profile.id,
              names: {
                firstName: fullName[0],
                lastName: fullName[1],
              },
              email: profile._json.email,
              username: tempUsername,
              password: '',
              profileImage: profileImageObj._doc._id,
              isAdmin: false,
              origin: 'Google',
            };

            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/auth/facebook/callback',
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            email: profile._json.email,
          });

          if (user) {
            done(null, user);
          } else {
            let tempUsername = createUsername(
              profile._json.first_name,
              profile._json.last_name
            );

            while (true) {
              if (!checkExistingUsername(tempUsername)) {
                break;
              }
              tempUsername = createUniqueUsername(
                profile._json.first_name,
                profile._json.last_name
              );
            }

            const profileImage = await UserProfileImage.findOne({
              id: profile.id,
            });

            let profileImageObj = {};
            if (profileImage) {
              profileImageObj = profileImage;
            } else {
              const profileImageTemp = {
                id: profile.id,
                name: `${profile._json.first_name} profile`,
                url: profile.photos[0].value,
                origin: 'Facebook',
              };
              profileImageObj = await UserProfileImage.create(profileImageTemp);
            }

            const newUser = {
              id: profile.id,
              names: {
                firstName: profile._json.first_name,
                lastName: profile._json.last_name,
              },
              email: profile._json.email,
              username: tempUsername,
              password: '',
              profileImage: profileImageObj._doc._id,
              isAdmin: false,
              origin: 'Google',
            };

            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
