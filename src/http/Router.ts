import { Router } from 'express';

import swaggerUi from 'swagger-ui-express';
import preSignedUrlsRoute from './routes/v1/preSignedUrlsRoute';
import healthCheck from './routes/healthCheck';

import swaggerDocument from '../swagger_output.json';

const options = {
  explorer: true,
};

const apiRouter = Router();
const routerV1 = Router();

// Non version controlled routes
apiRouter.use('/health-check', healthCheck);

if (process.env.NODE_ENV === 'development') {
  apiRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
}

// Version control
apiRouter.use('/v1', routerV1);

routerV1.use('/pre-signed-urls', preSignedUrlsRoute);

export default apiRouter;
