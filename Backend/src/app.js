import express from 'express';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import config from './config/index.js';

const app = express();

app.use(express.json());
app.use(morgan(config.logFormat));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
