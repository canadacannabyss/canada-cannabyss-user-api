const request = require('supertest');
const app = require('../../src/server');

describe('Test the root path', () => {
  test('It should response the GET method', () => {
    return request(app)
      .get('/blog')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });
});
