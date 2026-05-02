require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Connect to MongoDB and then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] running on port ${PORT}`);
  });
}).catch(err => {
  console.error('[Server] Failed to connect to DB', err);
  process.exit(1);
});
