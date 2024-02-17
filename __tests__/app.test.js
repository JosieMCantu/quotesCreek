/* eslint-disable quotes */
/* eslint-disable indent */
require('dotenv').config();

const { execSync } = require('child_process');
const { ENETDOWN } = require('constants');

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

    test('returns all the quotes with category_id', async () => {

      const expectation = [
        {
          "image": false,
          "name": "Johnny",
          "funny_level": "100",
          "category": "star",
          "category_id": 1,
          "quote": "Oh, I know I don’t have any money, but I need to look like I don’t have money."
        },
        {
          "image": true,
          "name": "David",
          "funny_level": "100",
          "category": "star",
          "category_id": 1,
          "quote": "I haven’t bedazzled anything since I was twenty-two."
        },
        {
          "image": true,
          "name": "Roland",
          "funny_level": "300",
          "category": "main",
          "category_id": 2,
          "quote": "If you’re looking for an ass to kiss, it’s mine."
        },
        {
          "image": true,
          "name": "Alexis",
          "funny_level": "200",
          "category": "main",
          "category_id": 2,
          "quote": "Stop doing that with your face."
        },
        {
          "image": false,
          "name": "Stevie",
          "funny_level": "100",
          "category": "secondary",
          "category_id": 3,
          "quote": "I’m incapable of faking sincerity."
        },
        {
          "image": true,
          "name": "Moira",
          "funny_level": "500",
          "category": "secondary",
          "category_id": 3,
          "quote": "I just want a bathtub and a long extension cord, please."
        }
      ]
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
          "category_id": 1,
          "owner_id": 1,
          "quote": "I haven’t bedazzled anything since I was twenty-two.",
        }
          ;

        const data = await fakeRequest(app)
          .get('/quotesCreek/1')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(data.body).toEqual(expectation);
      });

    test
      ('post a new quote', async () => {

        const expectation =
        {
          "id": 7,
          "image": false,
          "name": "Alexis",
          "funny_level": "200",
          "category_id": 1,
          "owner_id": 1,
          "quote": "Eew, David!",
        };
        const newQuote = {
          id: 7,
          image: false,
          name: "Alexis",
          funny_level: 200,
          category_id: 1,
          quote: "Eew, David!",
          owner_id: 1
        }

        const data = await fakeRequest(app)
          .post('/quotesCreek')
          .send(newQuote)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(data.body).toEqual(expectation);
      });

    test('deletes a quote', async () => {

      const expectation =
      {
        "id": 1,
        "image": true,
        "name": "David",
        "funny_level": "100",
        "category_id": 1,
        "owner_id": 1,
        "quote": "I haven’t bedazzled anything since I was twenty-two.",
      };

      const data = await fakeRequest(app)
        .delete('/quotesCreek/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const takeAway = await fakeRequest(app)
        .get('/quotesCreek/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(takeAway.body).toEqual("");
    });

    test
      ('updates a quote', async () => {

        const newQuote = {
          id: 5,
          image: true,
          name: "Roland",
          funny_level: "100",
          category_id: 2,
          quote: "If you’re looking for an ass to kiss, it’s mine.",
          owner_id: 1
        }

        const expectation =
        {
          ...newQuote,
          "id": 5,
          "owner_id": 1,
          "category": "main"
        };

        await fakeRequest(app)
          .put('/quotesCreek/5')
          .send(newQuote)
          .expect('Content-Type', /json/)
          .expect(200);

        const updatedQuote = await fakeRequest(app)
          .get('/quotesCreek/5')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(updatedQuote.body).toEqual(expectation);
      });
  });
});
