# Internship Training App - Setup Guide

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your MongoDB URI and other configurations
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/internship-training

# Start the backend server
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start the frontend development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running with Docker

```bash
# From the root directory
docker-compose up --build

# Stops services
docker-compose down
```

## Database Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB Community Edition
# On macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify connection
mongosh
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update MONGODB_URI in backend .env file

## Seed Data

To populate the database with initial data:

```bash
cd backend
npm run seed
```

This will create:
- 3 Career paths
- 6 Courses
- Modules and lessons for each course
- Sample quiz questions

## API Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Get careers (no auth required)
curl http://localhost:5000/api/careers

# Get current user (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

### Using Postman

1. Import the provided Postman collection
2. Set the `BASE_URL` variable to `http://localhost:5000`
3. Use the token from login response for authenticated endpoints

## Development Workflow

### Backend Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify connection string format

### CORS Errors
- Check CORS_ORIGIN in backend .env
- Ensure frontend URL matches CORS_ORIGIN
- Verify backend is running on the correct port

### Port Already in Use
```bash
# Backend (5000)
lsof -i :5000
kill -9 <PID>

# Frontend (3000)
lsof -i :3000
kill -9 <PID>
```

### Token Expired
- Clear browser localStorage
- Login again to get a new token

## Performance Tips

1. **Database Indexing**: Ensure MongoDB indexes are created for:
   - users.email
   - enrollments.user + enrollments.course
   - progress.user + progress.course

2. **Caching**: Implement Redis for caching:
   - Career listings
   - Course metadata
   - User sessions

3. **Pagination**: All list endpoints support pagination
   - Use `?page=1&limit=20` parameters

4. **Lazy Loading**: Frontend components implement code splitting
   - Routes are lazy loaded
   - Components use React.lazy()

## Deployment

### Backend Deployment (Heroku)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker Deployment (AWS, GCP, Azure)

1. Build Docker images
2. Push to registry
3. Deploy using container orchestration

## Security Checklist

- [ ] Change JWT_SECRET before production
- [ ] Use HTTPS in production
- [ ] Set secure cookies
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for trusted domains
- [ ] Implement password strength requirements
- [ ] Add two-factor authentication
- [ ] Regular security audits

## Support

For issues or questions:
1. Check documentation
2. Search existing issues
3. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Error messages
   - Environment details

## Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
