const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@stackit.com',
    password: 'Admin123!',
    isAdmin: true,
    bio: 'Platform administrator'
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'Password123!',
    bio: 'Full-stack developer passionate about JavaScript and React'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'Password123!',
    bio: 'Backend developer specializing in Node.js and MongoDB'
  },
  {
    username: 'alex_wong',
    email: 'alex@example.com',
    password: 'Password123!',
    bio: 'Frontend developer with expertise in Vue.js and CSS'
  },
  {
    username: 'sarah_jones',
    email: 'sarah@example.com',
    password: 'Password123!',
    bio: 'DevOps engineer and Docker enthusiast'
  }
];

const sampleQuestions = [
  {
    title: 'How to implement JWT authentication in Express.js?',
    description: 'I\'m building a REST API with Express.js and I want to implement JWT authentication. What\'s the best way to handle token generation, validation, and refresh tokens? I\'m using MongoDB as my database.',
    tags: ['javascript', 'express', 'jwt', 'authentication', 'mongodb'],
    createdBy: null // Will be set after user creation
  },
  {
    title: 'What are the differences between useState and useReducer in React?',
    description: 'I\'m learning React Hooks and I\'m confused about when to use useState vs useReducer. Can someone explain the key differences and provide examples of when each should be used?',
    tags: ['react', 'javascript', 'hooks', 'state-management'],
    createdBy: null
  },
  {
    title: 'Best practices for MongoDB schema design',
    description: 'I\'m designing a new MongoDB database and I want to follow best practices. What are the key considerations for schema design, indexing, and data modeling?',
    tags: ['mongodb', 'database', 'schema-design', 'nosql'],
    createdBy: null
  },
  {
    title: 'How to deploy a Node.js app to production?',
    description: 'I have a Node.js application that I want to deploy to production. What are the best practices for deployment, environment variables, logging, and monitoring?',
    tags: ['nodejs', 'deployment', 'production', 'devops'],
    createdBy: null
  },
  {
    title: 'Understanding async/await vs Promises',
    description: 'I\'m trying to understand the differences between async/await and Promises in JavaScript. When should I use each approach and what are the performance implications?',
    tags: ['javascript', 'async', 'promises', 'es6'],
    createdBy: null
  }
];

const sampleAnswers = [
  {
    content: 'JWT authentication in Express.js is straightforward. Here\'s a step-by-step approach:\n\n1. Install required packages: `npm install jsonwebtoken bcryptjs`\n2. Create middleware for token verification\n3. Implement login endpoint that generates tokens\n4. Use middleware to protect routes\n\nHere\'s a basic example:\n```javascript\nconst jwt = require(\'jsonwebtoken\');\n\n// Generate token\nconst token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: \'24h\' });\n\n// Verify token middleware\nconst auth = (req, res, next) => {\n  const token = req.header(\'Authorization\').replace(\'Bearer \', \'\');\n  const decoded = jwt.verify(token, process.env.JWT_SECRET);\n  req.user = decoded;\n  next();\n};\n```',
    questionId: null,
    createdBy: null
  },
  {
    content: 'useState and useReducer serve different purposes:\n\n**useState** is simpler and better for:\n- Simple state updates\n- Independent state values\n- When state logic is straightforward\n\n**useReducer** is better for:\n- Complex state logic\n- When state depends on previous state\n- When you have multiple sub-values\n- When you want to test state logic separately\n\nExample with useState:\n```javascript\nconst [count, setCount] = useState(0);\nsetCount(count + 1);\n```\n\nExample with useReducer:\n```javascript\nconst [state, dispatch] = useReducer(reducer, { count: 0 });\ndispatch({ type: \'increment\' });\n```',
    questionId: null,
    createdBy: null
  },
  {
    content: 'Here are the key MongoDB schema design best practices:\n\n1. **Embed vs Reference**: Embed for one-to-few relationships, reference for one-to-many\n2. **Denormalization**: Consider denormalizing for read-heavy applications\n3. **Indexing**: Create indexes on frequently queried fields\n4. **Document Size**: Keep documents under 16MB\n5. **Atomicity**: Design for atomic operations\n\nExample of good schema design:\n```javascript\n// User document\n{\n  _id: ObjectId,\n  username: String,\n  email: String,\n  profile: {\n    firstName: String,\n    lastName: String,\n    avatar: String\n  },\n  preferences: {\n    theme: String,\n    notifications: Boolean\n  }\n}\n```',
    questionId: null,
    createdBy: null
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    await Notification.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User({
        username: userData.username,
        email: userData.email,
        passwordHash: await bcrypt.hash(userData.password, 12),
        isAdmin: userData.isAdmin || false,
        bio: userData.bio
      });
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.username}`);
    }

    // Create questions
    const createdQuestions = [];
    for (let i = 0; i < sampleQuestions.length; i++) {
      const questionData = sampleQuestions[i];
      const question = new Question({
        ...questionData,
        createdBy: createdUsers[i % createdUsers.length]._id
      });
      await question.save();
      createdQuestions.push(question);
      console.log(`❓ Created question: ${question.title}`);
    }

    // Create answers
    for (let i = 0; i < sampleAnswers.length; i++) {
      const answerData = sampleAnswers[i];
      const answer = new Answer({
        ...answerData,
        questionId: createdQuestions[i]._id,
        createdBy: createdUsers[(i + 1) % createdUsers.length]._id
      });
      await answer.save();
      console.log(`💬 Created answer for question: ${createdQuestions[i].title}`);
    }

    // Create some notifications
    const notifications = [
      {
        userId: createdUsers[1]._id,
        type: 'answer',
        title: 'New answer to your question',
        message: 'john_doe answered your question about JWT authentication',
        link: `/questions/${createdQuestions[0]._id}`,
        relatedQuestion: createdQuestions[0]._id,
        relatedUser: createdUsers[1]._id
      },
      {
        userId: createdUsers[2]._id,
        type: 'accept',
        title: 'Your answer was accepted!',
        message: 'Your answer about React Hooks was accepted',
        link: `/questions/${createdQuestions[1]._id}`,
        relatedQuestion: createdQuestions[1]._id,
        relatedUser: createdUsers[0]._id
      }
    ];

    for (const notificationData of notifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`🔔 Created notification: ${notification.title}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users, ${createdQuestions.length} questions, ${sampleAnswers.length} answers, and ${notifications.length} notifications`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
};

// Run seeding
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase }; 