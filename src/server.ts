import { config } from 'dotenv';
import app from './app';

// Configure environment variables
config();

app.listen(process.env.PORT, () => {
  console.info(`⚡️ Server listening on port ${process.env.PORT}`);
});
