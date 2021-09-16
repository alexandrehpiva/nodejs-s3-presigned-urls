import express from 'express';
import cors from 'cors';
import routes from './http/Router';

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(routes);

export default app;
