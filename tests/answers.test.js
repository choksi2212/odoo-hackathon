const request = require('supertest');
const app = require('../app');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const {
  createTestUser,
  createTestQuestion,
  createTestAnswer,
  generateToken,
  validateResponseStructure,
  validateErrorResponse
} = require('./utils/testHelpers');

describe('Answers Endpoints', () => {
  describe('POST /api/answers/:questionId', () => {
    it('should create new answer successfully', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answerUser = await createTestUser({ username: 'answeruser' });
      const token = generateToken(answerUser._id);

      const answerData = {
        content: 'This is a detailed answer to the question with enough content to meet the minimum requirements.'
      };

      const response = await request(app)
        .post(`/api/answers/${question._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(answerData);

      expect(response.status).toBe(201);
      validateResponseStructure(response, ['answer']);
      expect(response.body.data.answer.content).toBe(answerData.content);
      expect(response.body.data.answer.createdBy).toBe(answerUser._id.toString());
    });

    it('should return error for non-existent question', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      const response = await request(app)
        .post('/api/answers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Test answer' });

      expect(response.status).toBe(404);
      validateErrorResponse(response, 404);
    });

    it('should return error for closed question', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({ isClosed: true }, user._id);
      const answerUser = await createTestUser({ username: 'answeruser' });
      const token = generateToken(answerUser._id);

      const response = await request(app)
        .post(`/api/answers/${question._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Test answer' });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });

    it('should return error for duplicate answer from same user', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answerUser = await createTestUser({ username: 'answeruser' });
      const token = generateToken(answerUser._id);

      // Create first answer
      await createTestAnswer({}, question._id, answerUser._id);

      // Try to create second answer
      const response = await request(app)
        .post(`/api/answers/${question._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Another answer' });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });
  });

  describe('GET /api/answers/:id', () => {
    it('should get answer by ID', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answer = await createTestAnswer({}, question._id, user._id);

      const response = await request(app)
        .get(`/api/answers/${answer._id}`);

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['answer']);
      expect(response.body.data.answer._id).toBe(answer._id.toString());
      expect(response.body.data.answer.content).toBe(answer.content);
    });

    it('should return 404 for non-existent answer', async () => {
      const response = await request(app)
        .get('/api/answers/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      validateErrorResponse(response, 404);
    });
  });

  describe('PATCH /api/answers/:id', () => {
    it('should update answer successfully', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answer = await createTestAnswer({}, question._id, user._id);
      const token = generateToken(user._id);

      const updateData = {
        content: 'Updated answer content with enough text to meet the minimum requirements.'
      };

      const response = await request(app)
        .patch(`/api/answers/${answer._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['answer']);
      expect(response.body.data.answer.content).toBe(updateData.content);
      expect(response.body.data.answer.isEdited).toBe(true);
    });

    it('should return error for non-author', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answer = await createTestAnswer({}, question._id, user._id);
      const otherUser = await createTestUser({ username: 'otheruser' });
      const token = generateToken(otherUser._id);

      const response = await request(app)
        .patch(`/api/answers/${answer._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Updated content' });

      expect(response.status).toBe(403);
      validateErrorResponse(response, 403);
    });
  });

  describe('DELETE /api/answers/:id', () => {
    it('should delete answer successfully', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answer = await createTestAnswer({}, question._id, user._id);
      const token = generateToken(user._id);

      const response = await request(app)
        .delete(`/api/answers/${answer._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      validateResponseStructure(response);

      // Verify answer was deleted
      const deletedAnswer = await Answer.findById(answer._id);
      expect(deletedAnswer).toBeNull();
    });

    it('should return error for non-author', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answer = await createTestAnswer({}, question._id, user._id);
      const otherUser = await createTestUser({ username: 'otheruser' });
      const token = generateToken(otherUser._id);

      const response = await request(app)
        .delete(`/api/answers/${answer._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      validateErrorResponse(response, 403);
    });
  });

  describe('PATCH /api/answers/:id/accept', () => {
    it('should accept answer successfully', async () => {
      const questionOwner = await createTestUser();
      const question = await createTestQuestion({}, questionOwner._id);
      const answerUser = await createTestUser({ username: 'answeruser' });
      const answer = await createTestAnswer({}, question._id, answerUser._id);
      const token = generateToken(questionOwner._id);

      const response = await request(app)
        .patch(`/api/answers/${answer._id}/accept`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['isAccepted']);
      expect(response.body.data.isAccepted).toBe(true);

      // Verify answer was accepted
      const updatedAnswer = await Answer.findById(answer._id);
      expect(updatedAnswer.isAccepted).toBe(true);
    });

    it('should unaccept answer when already accepted', async () => {
      const questionOwner = await createTestUser();
      const question = await createTestQuestion({}, questionOwner._id);
      const answerUser = await createTestUser({ username: 'answeruser' });
      const answer = await createTestAnswer({ isAccepted: true }, question._id, answerUser._id);
      const token = generateToken(questionOwner._id);

      const response = await request(app)
        .patch(`/api/answers/${answer._id}/accept`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isAccepted).toBe(false);
    });

    it('should return error for non-question-owner', async () => {
      const questionOwner = await createTestUser();
      const question = await createTestQuestion({}, questionOwner._id);
      const answerUser = await createTestUser({ username: 'answeruser' });
      const answer = await createTestAnswer({}, question._id, answerUser._id);
      const otherUser = await createTestUser({ username: 'otheruser' });
      const token = generateToken(otherUser._id);

      const response = await request(app)
        .patch(`/api/answers/${answer._id}/accept`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      validateErrorResponse(response, 403);
    });
  });

  describe('POST /api/answers/:id/vote', () => {
    it('should vote on answer successfully', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answer = await createTestAnswer({}, question._id, user._id);
      const voter = await createTestUser({ username: 'voter' });
      const token = generateToken(voter._id);

      const response = await request(app)
        .post(`/api/answers/${answer._id}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ value: 1 });

      expect(response.status).toBe(200);
      validateResponseStructure(response, ['voteCount']);
      expect(response.body.data.voteCount).toBe(1);
    });

    it('should return error for voting on own answer', async () => {
      const user = await createTestUser();
      const question = await createTestQuestion({}, user._id);
      const answer = await createTestAnswer({}, question._id, user._id);
      const token = generateToken(user._id);

      const response = await request(app)
        .post(`/api/answers/${answer._id}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ value: 1 });

      expect(response.status).toBe(400);
      validateErrorResponse(response, 400);
    });
  });
}); 