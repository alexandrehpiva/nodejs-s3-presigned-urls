import { config } from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import app from './app';

const swaggerDocument = require('../swagger_output.json');

// Configure environment variables
config();

var options = {
  explorer: true,
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.listen(process.env.PORT, () => {
  console.info(`⚡️ Server listening on port ${process.env.PORT}`);
});
