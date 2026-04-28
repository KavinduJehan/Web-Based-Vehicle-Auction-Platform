import app from './app.js';
import config from './config/index.js';
import startScheduler from './scheduler.js';

const port = config.port;

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
  startScheduler();
});
