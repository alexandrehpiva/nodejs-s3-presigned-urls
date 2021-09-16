import { Router } from 'express';

import preSignedUrlsRoute from './routes/v1/preSignedUrlsRoute';
import healthCheck from './routes/healthCheck';

const routes = Router();

routes.use('/health-check', healthCheck);
routes.use('/pre-signed-urls', preSignedUrlsRoute);

export default routes;
