# Community Platform - Backend API

Express.js REST API backend for the Community Platform with MongoDB integration.

## 🛠️ Tech Stack

- **Node.js** with TypeScript
- **Express.js** - Web framework
- **MongoDB** with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Zod** - Schema validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (local or Atlas)
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/community
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=8000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── config/             # Configuration files
│   └── database.ts     # MongoDB connection setup
├── middleware/         # Express middleware
│   └── auth.ts         # Authentication middleware
├── models/             # Mongoose data models
│   ├── User.ts         # User schema
│   ├── Post.ts         # Post schema
│   └── UserSession.ts  # Session management
├── routes/             # API route handlers
│   ├── auth.ts         # Authentication endpoints
│   ├── posts.ts        # Posts CRUD operations
│   ├── users.ts        # User profile management
│   └── health.ts       # Health check endpoint
├── utils/              # Utility functions
│   ├── jwt.ts          # JWT token utilities
│   └── session.ts      # Session management
└── index.ts            # Express app setup
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
GET  /api/auth/me          # Get current user
```

### Posts
```
GET    /api/posts          # Get all posts
POST   /api/posts          # Create new post
DELETE /api/posts/:id      # Delete post (owner only)
GET    /api/posts/user/:id # Get posts by user
```

### Users
```
GET /api/users/:id         # Get user profile
PUT /api/users/:id         # Update user profile (owner only)
```

### Health
```
GET /api/health            # System health check
```

## 🔐 Authentication & Security

### Session-Based Authentication
- Sessions stored in MongoDB with expiration
- Automatic cleanup of expired sessions
- Secure session token generation
- JWT tokens for stateless verification

### Security Features
- Password hashing with bcryptjs
- CORS configuration for frontend integration
- Input validation with Zod schemas
- Protected routes with authentication middleware
- Rate limiting ready (add middleware as needed)

### Authentication Flow
1. User registers/logs in
2. Server creates session in MongoDB
3. Session token returned to client
4. Token included in Authorization header
5. Middleware validates token on protected routes

## 🗄️ Database Schema

### User Model
```typescript
{
  name: string;           // User's display name
  email: string;          // Unique email address
  password: string;       // Hashed password
  bio?: string;           // Optional bio (max 500 chars)
  createdAt: Date;        // Account creation date
}
```

### Post Model
```typescript
{
  content: string;        // Post content (max 1000 chars)
  author: ObjectId;       // Reference to User
  createdAt: Date;        // Post creation date
  updatedAt: Date;        // Last modification date
}
```

### UserSession Model
```typescript
{
  userId: ObjectId;       // Reference to User
  sessionToken: string;   // Unique session identifier
  expiresAt: Date;        // Session expiration
  userAgent?: string;     // Client user agent
  ipAddress?: string;     // Client IP address
  createdAt: Date;        // Session creation date
}
```

## 🔧 Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/community

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Server
PORT=8000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

# Sessions
SESSION_TIMEOUT_DAYS=7

# MongoDB Connection Pool
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=5
```

### CORS Configuration
```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

## 🚀 Deployment Options

### Option 1: Vercel Serverless
```bash
# Deploy to Vercel
vercel --prod

# Or use vercel.json configuration
```

### Option 2: Docker
```bash
docker build -t community-backend .
docker run -p 8000:8000 \
  -e MONGODB_URI=your_uri \
  -e JWT_SECRET=your_secret \
  community-backend
```

### Option 3: Traditional Hosting
- Deploy to Heroku, Railway, DigitalOcean
- Set environment variables in hosting dashboard
- Use `npm start` as start command

## 🔍 Monitoring & Health

### Health Check Endpoint
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "database": {
    "connected": true,
    "state": "connected"
  },
  "services": ["auth", "posts", "users"]
}
```

### Logging
- Request/response logging in development
- Error logging with stack traces
- MongoDB connection status logging
- Session cleanup logging

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/api/health

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚦 Production Checklist

- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Configure production `MONGODB_URI` with authentication
- [ ] Set correct `FRONTEND_URL` for CORS
- [ ] Enable MongoDB authentication
- [ ] Set up MongoDB indexes for performance
- [ ] Configure logging service (e.g., Winston)
- [ ] Set up monitoring (e.g., New Relic, DataDog)
- [ ] Configure rate limiting middleware
- [ ] Set up backup strategy for MongoDB
- [ ] Enable HTTPS in production

## 🛡️ Security Best Practices

- Strong JWT secrets (32+ characters)
- Password hashing with salt rounds
- Session expiration and cleanup
- Input validation on all endpoints
- CORS properly configured
- No sensitive data in logs
- Environment variables for secrets
- Database connection with authentication

## 📝 API Documentation

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Success Response Format
```json
{
  "message": "Success message",
  "data": { /* Response data */ }
}
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Validate all inputs with Zod
4. Write comprehensive tests
5. Update API documentation
6. Follow REST conventions
