const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

app.use('/auth', authRoutes);

app.use('/api', ensureAuth);

app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/quotesCreek', async (req, res) => {
  try {
    const data = await client.query(`SELECT 
    quotesCreek.image, 
    quotesCreek.name, 
    quotesCreek.funny_level, 
    categories.name AS category,
    quotesCreek.category_id, 
    quotesCreek.quote 
    FROM quotesCreek 
    JOIN categories 
    ON quotesCreek.category_id = categories.id
    `);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const data = await client.query('SELECT * FROM categoriesData');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/quotesCreek/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(`SELECT 
    quotesCreek.image, 
    quotesCreek.name, 
    quotesCreek.funny_level, 
    categories.name AS category, 
    quotesCreek.quote,
    quotesCreek.id, 
    quotesCreek.category_id,
    quotesCreek.owner_id
    FROM quotesCreek 
    JOIN categories 
    ON quotesCreek.category_id = categories.id
    WHERE quotesCreek.id=$1`, [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/quotesCreek', async (req, res) => {
  try {
    const data = await client.query('INSERT into quotesCreek (image, name, funny_level, category_id, quote, owner_id) values ($1, $2, $3, $4, $5, $6) returning * ',
      [
        req.body.image,
        req.body.name,
        req.body.funny_level,
        req.body.category_id,
        req.body.quote,
        1
      ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/quotesCreek/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('DELETE from quotesCreek WHERE id=$1 returning *', [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.put('/quotesCreek/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const data = await client.query('UPDATE quotesCreek SET image = $1, name = $2, funny_level = $3, category_id = $4, quote = $5 WHERE id = $6 returning * ',
      [
        req.body.image,
        req.body.name,
        req.body.funny_level,
        req.body.category_id,
        req.body.quote,
        id
      ]);
    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
