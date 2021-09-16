import express from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerFile = require('../../../swagger_output.json');

const healthCheck = express.Router();

healthCheck.get('/', swaggerUi.serve, swaggerUi.setup(swaggerFile), (_req, res) => {
  console.info('health checked!');
  res.status(200);
  res.send('OK');
});

export default healthCheck;
