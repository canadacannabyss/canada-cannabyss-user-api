const slugify = require('slugify');
const User = require('../models/user/User');
const { getRandomInt } = require('./number');

module.exports = {
  checkExistingUsername: async (username) => {
    const res = await User.find({
      username,
    });

    return res.length > 0;
  },
  createUsername: (firstName, lastName) => {
    `${firstName}-${
      lastName
    }`.toLowerCase();
  },
  createUniqueUsername: (firstName, lastName) => `${firstName}-${
    lastName
  }-${getRandomInt(0, 10000)}`.toLowerCase(),
  splitIntoFirstAndLstNames: (name) => name.split(' '),
  slugifyUsername: (username) => slugify(username),
};
