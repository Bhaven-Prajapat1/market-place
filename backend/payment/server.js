const app = require('./src/app');
require('dotenv').config();
const connectDB = require('./src/db/db');
const { connect } = require('./src/broker/broker');

const PORT = process.env.PORT || 3004;

connectDB();
connect();

app.listen(PORT, () => {
  console.log(`Payment service is running on port ${PORT}`);
});