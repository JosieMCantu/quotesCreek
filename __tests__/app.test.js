require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns all the quotes', async () => {

      const expectation = [
        {
          "id": 1,
          "image": true,
          "name": "David",
          "funny_level": "100",
          "category": "star",
          "quote": "I haven’t bedazzled anything since I was twenty-two.",
          "owner_id": 1
        },
        {
          "id": 2,
          "image": true,
          "name": "Alexis",
          "funny_level": "200",
          "category": "star",
          "quote": "Stop doing that with your face.",
          "owner_id": 1
        }, {
          "id": 3,
          "image": true,
          "name": "Moira",
          "funny_level": "500",
          "category": "main",
          "quote": "I just want a bathtub and a long extension cord, please.",
          "owner_id": 1
        },
        {
          "id": 4,
          "image": false,
          "name": "Stevie",
          "funny_level": "100",
          "category": "main",
          "quote": "I’m incapable of faking sincerity.",
          "owner_id": 1
        },
        {
          "id": 5,
          "image": true,
          "name": "Roland",
          "funny_level": "300",
          "category": "secondary",
          "quote": "If you’re looking for an ass to kiss, it’s mine.",
          "owner_id": 1
        },
        {
          "id": 6,
          "image": false,
          "name": "Johnny",
          "funny_level": "100",
          "category": "main",
          "quote": "Oh, I know I don’t have any money, but I need to look like I don’t have money.",
          "owner_id": 1
        }]
        ;

      const data = await fakeRequest(app)
        .get('/quotesCreek')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test
      ('returns one quote', async () => {

        const expectation =
        {
          "id": 1,
          "image": true,
          "name": "David",
          "funny_level": "100",
          "category": "star",
          "quote": "I haven’t bedazzled anything since I was twenty-two.",
          "owner_id": 1
        }
          ;

        const data = await fakeRequest(app)
          .get('/quotesCreek/1')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(data.body).toEqual(expectation);
      });
  });
});
