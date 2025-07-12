# 🧪 StackIt API Testing Environment

This directory contains comprehensive tests for the StackIt backend API, ensuring all functionality works correctly and reliably.

## 📁 Test Structure

```
tests/
├── setup.js                 # Test environment setup
├── utils/
│   └── testHelpers.js      # Common test utilities
├── auth.test.js            # Authentication tests
├── questions.test.js       # Questions endpoint tests
├── answers.test.js         # Answers endpoint tests
├── integration.test.js     # End-to-end integration tests
└── README.md              # This file
```

## 🚀 Running Tests

### Prerequisites
- Node.js (v18+)
- All dependencies installed (`npm install`)

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Test Coverage

The test suite provides comprehensive coverage for:

- ✅ **Authentication** - Registration, login, profile management
- ✅ **Questions** - CRUD operations, voting, search, filtering
- ✅ **Answers** - CRUD operations, voting, acceptance
- ✅ **Users** - Profiles, activity tracking
- ✅ **Tags** - Tag management and search
- ✅ **Admin** - User management, content moderation
- ✅ **Integration** - Complete workflows and edge cases

## 🛠️ Test Environment

### In-Memory Database
Tests use `mongodb-memory-server` to create isolated, in-memory MongoDB instances for each test suite. This ensures:

- **Isolation**: Each test runs in a clean environment
- **Speed**: No external database dependencies
- **Reliability**: Tests don't interfere with each other

### Test Helpers
The `utils/testHelpers.js` file provides common utilities:

```javascript
// Create test users
const user = await createTestUser();
const admin = await createTestAdmin();

// Create test data
const question = await createTestQuestion();
const answer = await createTestAnswer();

// Generate JWT tokens
const token = generateToken(user._id);

// Validate responses
validateResponseStructure(response, ['user', 'token']);
validateErrorResponse(response, 400);
```

## 📊 Test Categories

### 1. Unit Tests
- **Authentication**: User registration, login, token validation
- **Models**: Database operations, validation, methods
- **Middleware**: Authentication, validation, error handling

### 2. Integration Tests
- **API Endpoints**: Complete request/response cycles
- **Database Operations**: CRUD operations with real data
- **Authentication Flow**: Token generation and validation

### 3. End-to-End Tests
- **Complete Workflows**: Full Q&A lifecycle
- **User Interactions**: Voting, accepting answers
- **Admin Operations**: User management, content moderation

## 🧪 Test Examples

### Authentication Test
```javascript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.data.user.username).toBe(userData.username);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### Question Creation Test
```javascript
describe('POST /api/questions', () => {
  it('should create new question successfully', async () => {
    const user = await createTestUser();
    const token = generateToken(user._id);

    const questionData = {
      title: 'How to implement JWT authentication?',
      description: 'I need help implementing JWT authentication.',
      tags: ['javascript', 'express', 'jwt']
    };

    const response = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(questionData);

    expect(response.status).toBe(201);
    expect(response.body.data.question.title).toBe(questionData.title);
  });
});
```

## 🔧 Test Configuration

### Jest Configuration
```json
{
  "testEnvironment": "node",
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
  "testMatch": ["**/tests/**/*.test.js"],
  "collectCoverageFrom": [
    "controllers/**/*.js",
    "models/**/*.js",
    "middlewares/**/*.js",
    "routes/**/*.js"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"]
}
```

### Environment Variables
Tests use a separate test environment with:
- In-memory MongoDB
- Test JWT secret
- Mocked console methods
- 30-second timeout

## 📈 Coverage Reports

After running `npm run test:coverage`, you'll get:

- **Text Report**: Console output with coverage summary
- **HTML Report**: Detailed coverage in `coverage/index.html`
- **LCOV Report**: For CI/CD integration

### Coverage Targets
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

## 🐛 Debugging Tests

### Running Specific Tests
```bash
# Run only authentication tests
npm test -- --grep "auth"

# Run specific test file
npm test tests/auth.test.js

# Run tests with verbose output
npm test -- --verbose
```

### Debug Mode
```bash
# Run tests with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Common Issues

1. **Timeout Errors**: Increase timeout in `setup.js`
2. **Database Connection**: Ensure MongoDB memory server is working
3. **Token Issues**: Check JWT secret configuration
4. **Async/Await**: Ensure proper async handling in tests

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

### Environment Variables for CI
```bash
NODE_ENV=test
JWT_SECRET=test-secret-key
MONGODB_URI=mongodb://localhost:27017/test
```

## 📝 Adding New Tests

### Test File Structure
```javascript
const request = require('supertest');
const app = require('../app');
const { createTestUser, generateToken } = require('./utils/testHelpers');

describe('Feature Name', () => {
  describe('GET /api/endpoint', () => {
    it('should do something', async () => {
      // Test implementation
    });
  });
});
```

### Best Practices
1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `afterEach` to clean up data
3. **Descriptive Names**: Clear test descriptions
4. **Assertions**: Test both success and error cases
5. **Coverage**: Aim for high test coverage

## 🎯 Test Categories

### Happy Path Tests
- ✅ Successful operations
- ✅ Valid data handling
- ✅ Proper response formats

### Error Path Tests
- ✅ Invalid input handling
- ✅ Authentication errors
- ✅ Authorization errors
- ✅ Database errors

### Edge Case Tests
- ✅ Boundary conditions
- ✅ Invalid IDs
- ✅ Missing data
- ✅ Concurrent operations

## 📊 Performance Testing

### Load Testing (Optional)
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery run tests/load-test.yml
```

### Memory Testing
```bash
# Run tests with memory profiling
node --expose-gc node_modules/.bin/jest --runInBand
```

---

**Happy Testing! 🧪✨** 