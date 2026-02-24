const { setupDB, teardownDB, clearDB } = require("./setup");

beforeAll(async () => {
  await setupDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await teardownDB();
});
