const fetch = require('node-fetch');

module.exports = {
  subscribe: async (email, names) => {
    const mcData = {
      email_address: email,
      merge_fields: {
        FNAME: names.firstName,
        LNAME: names.lastName,
      },
      status_if_new: 'subscribed',
      status: 'subscribed',
    };

    const res = await fetch(
      `https://${process.env.MAILCHIMP_INSTANCE}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
      {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `auth ${process.env.MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify(mcData),
      },
    );
    const data = await res.json();
    return data;
  },
};
