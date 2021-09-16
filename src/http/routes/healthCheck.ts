import express from 'express';

const healthCheck = express.Router();

/**
 * @swagger
 * /health-check:
 *  get:
 *    tags: []
 *    parameters: []
 *    description: Use to health-check the service
 *    responses:
 *      "200":
 *        description: Success
 */
healthCheck.get('/', (_req, res) => {
  console.info('health checked!');
  res.status(200);
  res.send('Success');
});

export default healthCheck;
