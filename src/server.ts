import app from 'app';
import { config } from 'dotenv';

// Configure environment variables
config();

app.listen(process.env.PORT, () => {
  console.info(`⚡️ Server listening on port ${process.env.PORT}`);
});
