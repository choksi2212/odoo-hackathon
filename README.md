# 🚀 StackIt Backend API

A complete, production-ready backend API for StackIt - a Q&A forum platform built with Node.js, Express.js, and MongoDB.

## ✨ Features

- **🔐 JWT Authentication** - Secure user registration and login
- **❓ Questions & Answers** - Full CRUD operations with voting system
- **🏷️ Tag Management** - Organize content with tags and search
- **🔔 Real-time Notifications** - User notifications for interactions
- **👥 User Profiles** - Public profiles with reputation system
- **🛡️ Admin Panel** - User management and content moderation
- **📊 Analytics** - Platform statistics and activity reports
- **🔒 Security** - Rate limiting, input validation, and security headers
- **🧪 Comprehensive Testing** - Full test suite with coverage reports

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Logging**: morgan
- **Testing**: Jest, Supertest, MongoDB Memory Server
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd stackit-backend
npm install
```

### 2. Environment Setup

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/stackit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

Make sure MongoDB is running, then seed the database with sample data:

```bash
npm run seed
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run simple tests (recommended for quick verification)
npm test tests/simple.test.js
```

### Test Coverage

The test suite includes:

- ✅ **Unit Tests** - Individual component testing
- ✅ **Integration Tests** - API endpoint testing
- ✅ **End-to-End Tests** - Complete workflow testing
- ✅ **Authentication Tests** - User registration, login, token validation
- ✅ **CRUD Tests** - Questions, answers, users, tags
- ✅ **Admin Tests** - User management, content moderation

### Test Environment

- **In-Memory Database** - MongoDB Memory Server for isolated testing
- **Test Helpers** - Common utilities for creating test data
- **Coverage Reports** - HTML and text coverage reports
- **CI/CD Ready** - Configured for continuous integration

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PATCH | `/api/auth/me` | Update user profile | Yes |
| PATCH | `/api/auth/change-password` | Change password | Yes |

### Questions Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/questions` | Get all questions (with filters) | No |
| GET | `/api/questions/:id` | Get single question | No |
| POST | `/api/questions` | Create new question | Yes |
| PATCH | `/api/questions/:id` | Update question | Yes |
| DELETE | `/api/questions/:id` | Delete question | Yes |
| POST | `/api/questions/:id/vote` | Vote on question | Yes |
| PATCH | `/api/questions/:id/close` | Close/Open question | Yes |

### Answers Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/answers/:questionId` | Create new answer | Yes |
| GET | `/api/answers/:id` | Get answer by ID | No |
| PATCH | `/api/answers/:id` | Update answer | Yes |
| DELETE | `/api/answers/:id` | Delete answer | Yes |
| PATCH | `/api/answers/:id/accept` | Accept/Unaccept answer | Yes |
| POST | `/api/answers/:id/vote` | Vote on answer | Yes |

### Tags Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tags` | Get all tags with usage count | No |
| GET | `/api/tags/popular` | Get popular tags | No |
| GET | `/api/tags/search/:query` | Search tags | No |
| GET | `/api/tags/:tag` | Get questions by tag | No |

### Users Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/top` | Get top users by reputation | No |
| GET | `/api/users/search/:query` | Search users | No |
| GET | `/api/users/me/questions` | Get current user's questions | Yes |
| GET | `/api/users/me/answers` | Get current user's answers | Yes |
| GET | `/api/users/:username` | Get user profile | No |

### Notifications Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | Yes |
| GET | `/api/notifications/stats` | Get notification statistics | Yes |
| PATCH | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications` | Delete all notifications | Yes |
| PATCH | `/api/notifications/:id/read` | Mark as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats` | Get platform statistics | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| GET | `/api/admin/questions` | Get questions for moderation | Admin |
| GET | `/api/admin/answers` | Get answers for moderation | Admin |
| PATCH | `/api/admin/ban/:userId` | Ban/Unban user | Admin |
| DELETE | `/api/admin/questions/:id` | Delete question (admin) | Admin |
| DELETE | `/api/admin/answers/:id` | Delete answer (admin) | Admin |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### Create Question
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "How to use async/await?",
    "description": "I need help understanding async/await in JavaScript.",
    "tags": ["javascript", "async", "es6"]
  }'
```

### Get Questions with Filters
```bash
curl "http://localhost:5000/api/questions?search=javascript&tag=react&sort=newest&page=1&limit=10"
```

## 🗄️ Database Schema

### User
```javascript
{
  username: String,
  email: String,
  passwordHash: String,
  isAdmin: Boolean,
  isBanned: Boolean,
  reputation: Number,
  avatar: String,
  bio: String,
  createdAt: Date,
  lastActive: Date
}
```

### Question
```javascript
{
  title: String,
  description: String,
  tags: [String],
  createdBy: ObjectId,
  views: Number,
  votes: [{ userId: ObjectId, value: Number }],
  isClosed: Boolean,
  acceptedAnswer: ObjectId,
  bounty: Number,
  bountyExpiry: Date,
  createdAt: Date
}
```

### Answer
```javascript
{
  questionId: ObjectId,
  content: String,
  createdBy: ObjectId,
  isAccepted: Boolean,
  votes: [{ userId: ObjectId, value: Number }],
  isEdited: Boolean,
  editedAt: Date,
  editHistory: [{ content: String, editedAt: Date }],
  createdAt: Date
}
```

### Notification
```javascript
{
  userId: ObjectId,
  type: String,
  title: String,
  message: String,
  link: String,
  read: Boolean,
  relatedQuestion: ObjectId,
  relatedAnswer: ObjectId,
  relatedUser: ObjectId,
  metadata: Object,
  createdAt: Date
}
```

## 🔧 Development

### Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Seed database
npm run seed
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/stackit |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize user input
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Error Handling** - Centralized error management

## 📊 Performance Features

- **Database Indexing** - Optimized queries
- **Pagination** - Efficient data loading
- **Compression** - Response compression
- **Logging** - Request/response logging

## 🧪 Testing Features

- **In-Memory Database** - Isolated test environment
- **Test Helpers** - Common utilities for test data
- **Coverage Reports** - Comprehensive test coverage
- **CI/CD Integration** - Ready for continuous integration
- **Multiple Test Types** - Unit, integration, and e2e tests

## 📦 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the StackIt community** 