const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const {
  createTestUser,
  createTestAdmin,
  createTestQuestion,
  generateToken,
  validateResponseStructure,
  validateErrorResponse
} = require('./utils/testHelpers');

describe('Integration Tests', () => {
  describe('Complete Q&A Flow', () => {
    it('should complete a full Q&A workflow', async () => {
      // 1. Register a new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(registerResponse.status).toBe(201);
      const token = registerResponse.body.data.token;

      // 2. Create a question
      const questionData = {
        title: 'How to implement authentication in Express.js?',
        description: 'I need help implementing user authentication in my Express.js application. What are the best practices?',
        tags: ['javascript', 'express', 'authentication']
      };

      const createQuestionResponse = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${token}`)
        .send(questionData);

      expect(createQuestionResponse.status).toBe(201);
      const questionId = createQuestionResponse.body.data.question._id;

      // 3. Create another user to answer
      const answerUser = await createTestUser({
        username: 'answeruser',
        email: 'answer@example.com'
      });
      const answerToken = generateToken(answerUser._id);

      // 4. Answer the question
      const answerData = {
        content: 'Here is a comprehensive answer about implementing authentication in Express.js. You should use JWT tokens and bcrypt for password hashing.'
      };

      const answerResponse = await request(app)
        .post(`/api/answers/${questionId}`)
        .set('Authorization', `Bearer ${answerToken}`)
        .send(answerData);

      expect(answerResponse.status).toBe(201);
      const answerId = answerResponse.body.data.answer._id;

      // 5. Vote on the question
      const voteResponse = await request(app)
        .post(`/api/questions/${questionId}/vote`)
        .set('Authorization', `Bearer ${answerToken}`)
        .send({ value: 1 });

      expect(voteResponse.status).toBe(200);

      // 6. Vote on the answer
      const answerVoteResponse = await request(app)
        .post(`/api/answers/${answerId}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ value: 1 });

      expect(answerVoteResponse.status).toBe(200);

      // 7. Accept the answer
      const acceptResponse = await request(app)
        .patch(`/api/answers/${answerId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      expect(acceptResponse.status).toBe(200);
      expect(acceptResponse.body.data.isAccepted).toBe(true);

      // 8. Verify the question has an accepted answer
      const getQuestionResponse = await request(app)
        .get(`/api/questions/${questionId}`);

      expect(getQuestionResponse.status).toBe(200);
      expect(getQuestionResponse.body.data.question.acceptedAnswer).toBe(answerId);
    });
  });

  describe('User Profile and Activity', () => {
    it('should track user activity and profile', async () => {
      // Create user and get token
      const user = await createTestUser();
      const token = generateToken(user._id);

      // Create multiple questions
      const questions = [];
      for (let i = 0; i < 3; i++) {
        const createQuestionResponse = await request(app)
          .post('/api/questions')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: `Test Question ${i + 1}`,
            description: `This is test question ${i + 1} description.`,
            tags: [`tag${i + 1}`, 'test']
          });

        expect(createQuestionResponse.status).toBe(201);
        questions.push(createQuestionResponse.body.data.question);
      }

      // Get user's questions
      const myQuestionsResponse = await request(app)
        .get('/api/users/me/questions')
        .set('Authorization', `Bearer ${token}`);

      expect(myQuestionsResponse.status).toBe(200);
      expect(myQuestionsResponse.body.data.questions).toHaveLength(3);

      // Get user profile
      const profileResponse = await request(app)
        .get(`/api/users/${user.username}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.user.username).toBe(user.username);
      expect(profileResponse.body.data.questions.count).toBe(3);
    });
  });

  describe('Search and Filtering', () => {
    it('should handle search and filtering correctly', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      // Create questions with different tags
      const questions = [
        {
          title: 'React hooks tutorial',
          description: 'How to use React hooks effectively?',
          tags: ['react', 'javascript', 'hooks']
        },
        {
          title: 'Vue.js vs React comparison',
          description: 'What are the differences between Vue.js and React?',
          tags: ['vue', 'react', 'javascript', 'comparison']
        },
        {
          title: 'Node.js backend development',
          description: 'Best practices for Node.js backend development',
          tags: ['nodejs', 'backend', 'javascript']
        }
      ];

      for (const questionData of questions) {
        const response = await request(app)
          .post('/api/questions')
          .set('Authorization', `Bearer ${token}`)
          .send(questionData);

        expect(response.status).toBe(201);
      }

      // Search for React questions
      const searchResponse = await request(app)
        .get('/api/questions')
        .query({ search: 'React' });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data.questions.length).toBeGreaterThan(0);

      // Filter by tag
      const tagResponse = await request(app)
        .get('/api/questions')
        .query({ tag: 'javascript' });

      expect(tagResponse.status).toBe(200);
      expect(tagResponse.body.data.questions.length).toBeGreaterThan(0);

      // Get popular tags
      const tagsResponse = await request(app)
        .get('/api/tags/popular');

      expect(tagsResponse.status).toBe(200);
      expect(tagsResponse.body.data.tags.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Functionality', () => {
    it('should handle admin operations correctly', async () => {
      // Create admin user
      const admin = await createTestAdmin();
      const adminToken = generateToken(admin._id);

      // Create regular user
      const user = await createTestUser();
      const userToken = generateToken(user._id);

      // Create question as regular user
      const createQuestionResponse = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test question for admin',
          description: 'This question will be managed by admin.',
          tags: ['test', 'admin']
        });

      expect(createQuestionResponse.status).toBe(201);
      const questionId = createQuestionResponse.body.data.question._id;

      // Admin gets platform stats
      const statsResponse = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.data.overview.totalQuestions).toBeGreaterThan(0);

      // Admin gets all users
      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(usersResponse.status).toBe(200);
      expect(usersResponse.body.data.users.length).toBeGreaterThan(0);

      // Admin deletes question
      const deleteResponse = await request(app)
        .delete(`/api/admin/questions/${questionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);

      // Verify question was deleted
      const questionCheckResponse = await request(app)
        .get(`/api/questions/${questionId}`);

      expect(questionCheckResponse.status).toBe(404);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid requests gracefully', async () => {
      // Test invalid question ID
      const response = await request(app)
        .get('/api/questions/invalid-id');

      expect(response.status).toBe(400);

      // Test invalid answer ID
      const answerResponse = await request(app)
        .get('/api/answers/invalid-id');

      expect(answerResponse.status).toBe(400);

      // Test non-existent user
      const userResponse = await request(app)
        .get('/api/users/nonexistentuser');

      expect(userResponse.status).toBe(404);
    });

    it('should handle authentication edge cases', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);

      // Test expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDQ5YzQ5YzQ5YzQ5YzQ5YzQ5YzQ5YyIsImlhdCI6MTY4MjY5NjAwMCwiZXhwIjoxNjgyNjk2MDAwfQ.invalid-signature';

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });
}); 