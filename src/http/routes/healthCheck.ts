import express from 'express';

const healthCheck = express.Router();

healthCheck.get('/', (_req, res) => {
  console.info('health checked!');
  res.status(200);
  res.send('OK');
});

export default healthCheck;
