const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.RATE_LIMIT_MAX_REQUESTS = '1000'; // Disable rate limiting for tests
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    try {
      await collection.deleteMany({});
    } catch (error) {
      // Ignore errors if collection doesn't exist
      console.warn(`Failed to clear collection ${key}:`, error.message);
    }
  }
  
  // Clear any cached data
  // if (mongoose.connection.models) {
  //   Object.keys(mongoose.connection.models).forEach(modelName => {
  //     delete mongoose.connection.models[modelName];
  //   });
  // }
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect and stop in-memory server
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 