const jwt = require('jsonwebtoken');

module.exports = {
  generateAccessToken: (user) => jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 86400,
  }),
  decodeToken: (token) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return {};
      return user;
    });
  },
};
