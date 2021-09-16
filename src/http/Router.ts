import { Router } from 'express';

import swaggerUi from 'swagger-ui-express';
import preSignedUrlsRoute from './routes/v1/preSignedUrlsRoute';
import healthCheck from './routes/healthCheck';
// import swaggerDocument from '../swagger_output.json';
import { swaggerDocs } from '../config/swaggerConfig';

const apiRouter = Router();
const routerV1 = Router();

// Non version controlled routes
apiRouter.use('/health-check', healthCheck);

if (process.env.NODE_ENV !== 'production') {
  apiRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// Version control
apiRouter.use('/v1', routerV1);

routerV1.use('/pre-signed-urls', preSignedUrlsRoute);

export default apiRouter;
