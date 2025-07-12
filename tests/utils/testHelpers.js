const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Question = require('../../models/Question');
const Answer = require('../../models/Answer');

// Helper to create a test user
const createTestUser = async (userData = {}) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  const defaultUser = {
    username: `testuser_${timestamp}_${randomId}`,
    email: `test_${timestamp}_${randomId}@example.com`,
    password: 'Password123!',
    isAdmin: false,
    bio: 'Test user bio'
  };

  const user = new User({
    ...defaultUser,
    ...userData,
    passwordHash: await require('bcryptjs').hash(
      userData.password || defaultUser.password, 
      12
    )
  });

  await user.save();
  return user;
};

// Helper to create a test admin user
const createTestAdmin = async (adminData = {}) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  const defaultAdmin = {
    username: `admin_${timestamp}_${randomId}`,
    email: `admin_${timestamp}_${randomId}@example.com`,
    password: 'Admin123!',
    isAdmin: true,
    bio: 'Admin user'
  };

  const admin = new User({
    ...defaultAdmin,
    ...adminData,
    passwordHash: await require('bcryptjs').hash(
      adminData.password || defaultAdmin.password, 
      12
    )
  });

  await admin.save();
  return admin;
};

// Helper to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// Helper to create a test question
const createTestQuestion = async (questionData = {}, userId = null) => {
  if (!userId) {
    const user = await createTestUser();
    userId = user._id;
  }

  const defaultQuestion = {
    title: 'Test Question Title',
    description: 'This is a test question description with enough content to meet the minimum requirements.',
    tags: ['test', 'javascript'],
    createdBy: userId
  };

  const question = new Question({
    ...defaultQuestion,
    ...questionData
  });

  await question.save();
  return question;
};

// Helper to create a test answer
const createTestAnswer = async (answerData = {}, questionId = null, userId = null) => {
  if (!questionId) {
    const question = await createTestQuestion();
    questionId = question._id;
  }

  if (!userId) {
    const user = await createTestUser();
    userId = user._id;
  }

  const defaultAnswer = {
    content: 'This is a test answer with enough content to meet the minimum requirements.',
    questionId,
    createdBy: userId
  };

  const answer = new Answer({
    ...defaultAnswer,
    ...answerData
  });

  await answer.save();
  return answer;
};

// Helper to login and get token
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return generateToken(user._id);
};

// Helper to make authenticated request
const makeAuthenticatedRequest = (request, token) => {
  return request.set('Authorization', `Bearer ${token}`);
};

// Helper to create multiple test users
const createMultipleUsers = async (count = 3) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() + i;
    const randomId = Math.random().toString(36).substring(7);
    
    const user = await createTestUser({
      username: `user${i + 1}_${timestamp}_${randomId}`,
      email: `user${i + 1}_${timestamp}_${randomId}@example.com`
    });
    users.push(user);
  }
  return users;
};

// Helper to create multiple test questions
const createMultipleQuestions = async (count = 3, userId = null) => {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const question = await createTestQuestion({
      title: `Test Question ${i + 1}`,
      description: `This is test question ${i + 1} description.`,
      tags: [`tag${i + 1}`, 'test']
    }, userId);
    questions.push(question);
  }
  return questions;
};

// Helper to validate response structure
const validateResponseStructure = (response, expectedFields = []) => {
  expect(response.body).toHaveProperty('success');
  expect(response.body.success).toBe(true);
  
  if (expectedFields.length > 0) {
    expect(response.body).toHaveProperty('data');
    expectedFields.forEach(field => {
      expect(response.body.data).toHaveProperty(field);
    });
  }
};

// Helper to validate error response
const validateErrorResponse = (response, expectedCode = 400) => {
  expect(response.body).toHaveProperty('error');
  expect(response.body).toHaveProperty('code');
  expect(response.body.code).toBe(expectedCode);
};

module.exports = {
  createTestUser,
  createTestAdmin,
  generateToken,
  createTestQuestion,
  createTestAnswer,
  loginUser,
  makeAuthenticatedRequest,
  createMultipleUsers,
  createMultipleQuestions,
  validateResponseStructure,
  validateErrorResponse
}; 