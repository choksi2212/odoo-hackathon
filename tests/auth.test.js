const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const {
  createTestUser,
  createTestAdmin,
  generateToken,
  validateResponseStructure,
  validateErrorResponse
} = require('./utils/testHelpers');

describe('Authentication Endpoints', () => {
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
      validateResponseStructure(response, ['user', 'token']);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for duplicate email', async () => {
      const user = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'differentuser',
          email: user.email,
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });

    it('should return error for duplicate username', async () => {
      const user = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: user.username,
          email: 'different@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });

    it('should return error for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'invalid-email',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });

    it('should return error for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const user = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['user', 'token']);
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      validateErrorResponse(response, 401);
    });

    it('should return error for invalid password', async () => {
      const user = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      validateErrorResponse(response, 401);
    });

    it('should return error for banned user', async () => {
      const user = await createTestUser({ isBanned: true });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'Password123!'
        });

      expect(response.status).toBe(403);
      validateErrorResponse(response, 403);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['user']);
      expect(response.body.data.user._id).toBe(user._id.toString());
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      validateErrorResponse(response, 401);
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      validateErrorResponse(response, 401);
    });
  });

  describe('PATCH /api/auth/me', () => {
    it('should update user profile successfully', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const updateData = {
        username: 'updateduser',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['user']);
      expect(response.body.data.user.username).toBe(updateData.username);
      expect(response.body.data.user.bio).toBe(updateData.bio);
    });

    it('should return error for duplicate username', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ username: 'existinguser' });
      const token = generateToken(user1._id);

      const response = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: user2.username });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });
  });

  describe('PATCH /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const response = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(200);
      validateResponseStructure(response);

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'NewPassword123!'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should return error for incorrect current password', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const response = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });
  });
}); 