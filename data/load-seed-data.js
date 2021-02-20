const client = require('../lib/client');
// import our seed data:
const quotesCreek = require('./quotesData.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      quotesCreek.map(quote => {
        return client.query(`
                    INSERT INTO quotesCreek (image, name, funny_level, category, quote, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [quote.image, quote.name, quote.funny_level, quote.category, quote.quote, user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
