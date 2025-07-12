const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const {
  createTestUser,
  generateToken,
  validateResponseStructure,
  validateErrorResponse
} = require('./utils/testHelpers');

describe('Simple API Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      
      const userData = {
        username: `testuser_${timestamp}_${randomId}`,
        email: `test_${timestamp}_${randomId}@example.com`,
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();
    });

    it('should login user', async () => {
      // First create a user
      const user = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('Questions', () => {
    it('should get questions list', async () => {
      const response = await request(app)
        .get('/api/questions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('questions');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should create a question', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const questionData = {
        title: 'Test Question Title',
        description: 'This is a test question description with enough content to meet the minimum requirements.',
        tags: ['test', 'javascript']
      };

      const response = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${token}`)
        .send(questionData);

      if (response.status !== 201) {
        throw new Error('Response body: ' + JSON.stringify(response.body, null, 2));
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.question.title).toBe(questionData.title);
    });
  });

  describe('Users', () => {
    it('should get top users', async () => {
      const response = await request(app)
        .get('/api/users/top');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
    });
  });

  describe('Tags', () => {
    it('should get popular tags', async () => {
      const response = await request(app)
        .get('/api/tags/popular');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tags');
    });
  });
}); 