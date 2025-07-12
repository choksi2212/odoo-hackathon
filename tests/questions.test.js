const request = require('supertest');
const app = require('../app');
const Question = require('../models/Question');
const {
  createTestUser,
  createTestQuestion,
  createMultipleQuestions,
  generateToken,
  validateResponseStructure,
  validateErrorResponse
} = require('./utils/testHelpers');

describe('Questions Endpoints', () => {
  describe('GET /api/questions', () => {
    it('should get all questions with pagination', async () => {
      const user = await createTestUser();
      await createMultipleQuestions(5, user._id);

      const response = await request(app)
        .get('/api/questions')
        .query({ page: 1, limit: 3 });

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['questions', 'pagination']);
      expect(response.body.data.questions).toHaveLength(3);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalItems).toBe(5);
    });

    it('should filter questions by search term', async () => {
      const user = await createTestUser();
      await createTestQuestion({
        title: 'JavaScript async await question',
        description: 'How to use async await in JavaScript? This is a detailed description with enough content to meet the minimum requirements.'
      }, user._id);
      await createTestQuestion({
        title: 'Python programming question',
        description: 'How to use Python? This is a detailed description with enough content to meet the minimum requirements.'
      }, user._id);

      const response = await request(app)
        .get('/api/questions')
        .query({ search: 'JavaScript' });

      expect(response.status).toBe(200);
      expect(response.body.data.questions).toHaveLength(1);
      expect(response.body.data.questions[0].title).toContain('JavaScript');
    });

    it('should filter questions by tag', async () => {
      const user = await createTestUser();
      await createTestQuestion({
        title: 'React question',
        tags: ['react', 'javascript']
      }, user._id);
      await createTestQuestion({
        title: 'Vue question',
        tags: ['vue', 'javascript']
      }, user._id);

      const response = await request(app)
        .get('/api/questions')
        .query({ tag: 'react' });

      expect(response.status).toBe(200);
      expect(response.body.data.questions).toHaveLength(1);
      expect(response.body.data.questions[0].tags).toContain('react');
    });

    it('should sort questions by different criteria', async () => {
      const user = await createTestUser();
      await createMultipleQuestions(3, user._id);

      const response = await request(app)
        .get('/api/questions')
        .query({ sort: 'newest' });

      expect(response.status).toBe(200);
      expect(response.body.data.questions).toHaveLength(3);
    });
  });

  describe('GET /api/questions/:id', () => {
    it('should get single question by ID', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);

      const response = await request(app)
        .get(`/api/questions/${question._id}`);

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['question', 'answers']);
      expect(response.body.data.question._id).toBe(question._id.toString());
      expect(response.body.data.question.title).toBe(question.title);
    });

    it('should return 404 for non-existent question', async () => {
      const response = await request(app)
        .get('/api/questions/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      validateErrorResponse(response, 404);
    });

    it('should increment views for non-author', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const otherUser = await createTestUser({ username: 'otheruser' });
      const token = generateToken(otherUser._id);

      const response = await request(app)
        .get(`/api/questions/${question._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      // Verify view was incremented
      const updatedQuestion = await Question.findById(question._id);
      expect(updatedQuestion.views).toBe(1);
    });
  });

  describe('POST /api/questions', () => {
    it('should create new question successfully', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const questionData = {
        title: 'How to implement JWT authentication?',
        description: 'I need help implementing JWT authentication in my Express.js application.',
        tags: ['javascript', 'express', 'jwt', 'authentication']
      };

      const response = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${token}`)
        .send(questionData);

      expect(response.status).toBe(201);
      validateResponseStructure(response, ['question']);
      expect(response.body.data.question.title).toBe(questionData.title);
      expect(response.body.data.question.createdBy._id || response.body.data.question.createdBy).toBe(user._id.toString());
    });

    it('should return error without authentication', async () => {
      const questionData = {
        title: 'Test question',
        description: 'Test description',
        tags: ['test']
      };

      const response = await request(app)
        .post('/api/questions')
        .send(questionData);

      expect(response.status).toBe(401);
      validateErrorResponse(response, 401);
    });

    it('should return error for invalid question data', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const response = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Short',
          description: 'Too short',
          tags: []
        });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });
  });

  describe('PATCH /api/questions/:id', () => {
    it('should update question successfully', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const token = generateToken(user._id);

      const updateData = {
        title: 'Updated question title',
        description: 'Updated question description',
        tags: ['updated', 'javascript']
      };

      const response = await request(app)
        .patch(`/api/questions/${question._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['question']);
      expect(response.body.data.question.title).toBe(updateData.title);
      expect(response.body.data.question.description).toBe(updateData.description);
    });

    it('should return error for non-author', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const otherUser = await createTestUser({ username: 'otheruser' });
      const token = generateToken(otherUser._id);

      const response = await request(app)
        .patch(`/api/questions/${question._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated title' });

      expect(response.status).toBe(403);
      validateErrorResponse(response, 403);
    });
  });

  describe('DELETE /api/questions/:id', () => {
    it('should delete question successfully', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const token = generateToken(user._id);

      const response = await request(app)
        .delete(`/api/questions/${question._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      validateResponseStructure(response);

      // Verify question was deleted
      const deletedQuestion = await Question.findById(question._id);
      expect(deletedQuestion).toBeNull();
    });

    it('should return error for non-author', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const otherUser = await createTestUser({ username: 'otheruser' });
      const token = generateToken(otherUser._id);

      const response = await request(app)
        .delete(`/api/questions/${question._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      validateErrorResponse(response, 403);
    });
  });

  describe('POST /api/questions/:id/vote', () => {
    it('should vote on question successfully', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const voter = await createTestUser({ username: 'voter' });
      const token = generateToken(voter._id);

      const response = await request(app)
        .post(`/api/questions/${question._id}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ value: 1 });

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['voteCount']);
      expect(response.body.data.voteCount).toBe(1);
    });

    it('should return error for voting on own question', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const token = generateToken(user._id);

      const response = await request(app)
        .post(`/api/questions/${question._id}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ value: 1 });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });
  });

  describe('PATCH /api/questions/:id/close', () => {
    it('should toggle question status successfully', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const token = generateToken(user._id);

      const response = await request(app)
        .patch(`/api/questions/${question._id}/close`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['isClosed']);
      expect(response.body.data.isClosed).toBe(true);
    });

    it('should return error for non-author', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const otherUser = await createTestUser({ username: 'otheruser' });
      const token = generateToken(otherUser._id);

      const response = await request(app)
        .patch(`/api/questions/${question._id}/close`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      validateErrorResponse(response, 403);
    });
  });
}); 