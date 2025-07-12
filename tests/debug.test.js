const request = require('supertest');
const app = require('../app');
const { createTestUser, generateToken } = require('./utils/testHelpers');

describe('Debug Test', () => {
  it('should debug question creation', async () => {
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

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    expect(response.status).toBe(201);
  });
}); 