import app from './app.js';
import config from './config/index.js';

const port = config.port;

app.listen(port, () => {
  // Keep log terse; port is enough for local dev
  console.log(`API listening on port ${port}`);
});
