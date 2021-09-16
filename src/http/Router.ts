import { Router } from 'express';

import preSignedUrlsRoute from './routes/v1/preSignedUrlsRoute';
import healthCheck from './routes/healthCheck';

const apiRouter = Router();
const routerV1 = Router();

// Non version controlled routes
apiRouter.use('/health-check', healthCheck);

// Version control
apiRouter.use('/v1', routerV1);

routerV1.use('/pre-signed-urls', preSignedUrlsRoute);

export default apiRouter;
