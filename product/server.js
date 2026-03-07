require('dotenv').config();
const app = require('./src/app');
const connectDb = require('./src/db/db');

connectDb();

app.listen(3001, () => {
  console.log('Product service is running on port 3001');
});

