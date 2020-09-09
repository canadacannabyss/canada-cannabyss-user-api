const slugify = require('slugify');
const uuid = require('uuid');

module.exports = {
  slugifyString: (string) => slugify(string).toLowerCase(),
  generateRandomSlug: async (slug) => {
    const id = uuid.v4();
    const generatedNewSlug = `${slug}-${id}`;
    return generatedNewSlug;
  },
  slugifyUsername: (username) => slugify(username),
};
