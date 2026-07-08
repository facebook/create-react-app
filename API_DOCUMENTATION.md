# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses are in JSON format with the following structure:
```json
{
  "data": {},
  "message": "Success message",
  "error": "Error message (if applicable)"
}
```

---

## Auth Endpoints

### Register
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Status Code:** 201

---

### Login
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Status Code:** 200

---

### Get Current User
**GET** `/auth/me`

Get authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "enrolledCareers": [],
  "completedCourses": [],
  "certificates": []
}
```

**Status Code:** 200

---

## Career Endpoints

### Get All Careers
**GET** `/careers`

Get list of all available careers.

**Query Parameters:**
- `featured` (boolean, optional) - Filter featured careers only

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Full Stack Web Developer",
    "description": "Learn to build complete web applications",
    "icon": "💻",
    "duration": 6,
    "difficulty": "intermediate",
    "skills": ["HTML", "CSS", "JavaScript", "React"],
    "prerequisites": ["Basic Programming"],
    "salaryRange": { "min": 60, "max": 120 },
    "jobMarketDemand": "High",
    "featured": true,
    "courses": []
  }
]
```

**Status Code:** 200

---

### Get Career by ID
**GET** `/careers/:id`

Get detailed information about a specific career.

**Parameters:**
- `id` (string) - Career ID

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Full Stack Web Developer",
  "description": "Learn to build complete web applications",
  "icon": "💻",
  "duration": 6,
  "difficulty": "intermediate",
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "prerequisites": ["Basic Programming"],
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Full Stack Web Developer Masterclass",
      "duration": 60,
      "modules": []
    }
  ],
  "salaryRange": { "min": 60, "max": 120 },
  "jobMarketDemand": "High"
}
```

**Status Code:** 200

---

### Create Career
**POST** `/careers`

Create a new career path (admin/instructor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Cloud Architect",
  "description": "Design and manage cloud infrastructure",
  "icon": "☁️",
  "duration": 8,
  "difficulty": "advanced",
  "skills": ["AWS", "Azure", "GCP", "Kubernetes"],
  "prerequisites": ["System Design", "Linux"],
  "salaryRange": { "min": 100, "max": 180 },
  "jobMarketDemand": "Very High"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "Cloud Architect",
  "description": "Design and manage cloud infrastructure",
  "icon": "☁️",
  "duration": 8,
  "difficulty": "advanced",
  "skills": ["AWS", "Azure", "GCP", "Kubernetes"],
  "prerequisites": ["System Design", "Linux"],
  "courses": [],
  "salaryRange": { "min": 100, "max": 180 },
  "jobMarketDemand": "Very High",
  "featured": false
}
```

**Status Code:** 201

---

## Course Endpoints

### Get All Courses
**GET** `/courses`

Get list of all courses.

**Query Parameters:**
- `career` (string, optional) - Filter by career ID
- `difficulty` (string, optional) - Filter by difficulty level
- `published` (boolean, optional) - Filter by published status

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Full Stack Web Developer Masterclass",
    "description": "Complete course for becoming a full stack developer",
    "duration": 60,
    "difficulty": "intermediate",
    "instructor": {
      "_id": "507f1f77bcf86cd799439001",
      "firstName": "John",
      "lastName": "Instructor",
      "profileImage": "https://..."
    },
    "career": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Full Stack Web Developer"
    },
    "enrollmentCount": 150,
    "rating": 4.8,
    "isPublished": true,
    "price": 99
  }
]
```

**Status Code:** 200

---

### Get Course by ID
**GET** `/courses/:id`

Get detailed course information with modules and lessons.

**Parameters:**
- `id` (string) - Course ID

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "title": "Full Stack Web Developer Masterclass",
  "description": "Complete course for becoming a full stack developer",
  "duration": 60,
  "difficulty": "intermediate",
  "instructor": {
    "_id": "507f1f77bcf86cd799439001",
    "firstName": "John",
    "lastName": "Instructor",
    "bio": "10+ years of web development experience"
  },
  "modules": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "title": "Module 1: Fundamentals",
      "order": 1,
      "lessons": [
        {
          "_id": "507f1f77bcf86cd799439017",
          "title": "Lesson 1: HTML Basics",
          "videoUrl": "https://...",
          "videoDuration": 1800,
          "order": 1
        }
      ]
    }
  ],
  "enrollmentCount": 150,
  "rating": 4.8,
  "reviews": [
    {
      "userId": "507f1f77bcf86cd799439002",
      "rating": 5,
      "comment": "Excellent course!",
      "createdAt": "2024-01-15"
    }
  ],
  "isPublished": true,
  "price": 99
}
```

**Status Code:** 200

---

### Create Course
**POST** `/courses`

Create a new course (instructor/admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Advanced React Patterns",
  "description": "Learn advanced React patterns and techniques",
  "career": "507f1f77bcf86cd799439012",
  "duration": 40,
  "difficulty": "advanced",
  "thumbnail": "https://...",
  "price": 129
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439018",
  "title": "Advanced React Patterns",
  "description": "Learn advanced React patterns and techniques",
  "career": "507f1f77bcf86cd799439012",
  "duration": 40,
  "difficulty": "advanced",
  "instructor": "507f1f77bcf86cd799439001",
  "price": 129,
  "isPublished": false,
  "modules": [],
  "enrollmentCount": 0,
  "rating": 0
}
```

**Status Code:** 201

---

### Publish Course
**PATCH** `/courses/:id/publish`

Publish a course (make it available to students).

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string) - Course ID

**Response:**
```json
{
  "message": "Course published successfully",
  "course": {
    "_id": "507f1f77bcf86cd799439018",
    "title": "Advanced React Patterns",
    "isPublished": true
  }
}
```

**Status Code:** 200

---

## Progress Endpoints

### Get Course Progress
**GET** `/progress/course/:courseId`

Get user's progress in a specific course.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `courseId` (string) - Course ID

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "user": "507f1f77bcf86cd799439002",
  "course": "507f1f77bcf86cd799439015",
  "progressPercentage": 45,
  "timeSpent": 720,
  "status": "in_progress",
  "completedLessons": ["507f1f77bcf86cd799439021"],
  "completedModules": ["507f1f77bcf86cd799439016"],
  "lastAccessedAt": "2024-01-20T10:30:00Z"
}
```

**Status Code:** 200

---

### Update Lesson Progress
**POST** `/progress/lesson/:courseId/:lessonId`

Record lesson watching progress.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `courseId` (string) - Course ID
- `lessonId` (string) - Lesson ID

**Request Body:**
```json
{
  "watchedDuration": 1200,
  "isCompleted": true
}
```

**Response:**
```json
{
  "message": "Progress updated successfully",
  "lessonProgress": {
    "_id": "507f1f77bcf86cd799439022",
    "user": "507f1f77bcf86cd799439002",
    "lesson": "507f1f77bcf86cd799439017",
    "course": "507f1f77bcf86cd799439015",
    "watchedDuration": 1200,
    "isCompleted": true,
    "completedAt": "2024-01-20T10:30:00Z"
  }
}
```

**Status Code:** 200

---

### Get User Progress
**GET** `/progress/user`

Get user's progress across all enrolled courses.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "user": "507f1f77bcf86cd799439002",
    "course": {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Full Stack Web Developer Masterclass",
      "thumbnail": "https://..."
    },
    "progressPercentage": 45,
    "timeSpent": 720,
    "status": "in_progress"
  }
]
```

**Status Code:** 200

---

## User Endpoints

### Get Profile
**GET** `/users/profile`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439002",
  "email": "student@example.com",
  "firstName": "Alice",
  "lastName": "Smith",
  "profileImage": "https://...",
  "bio": "Aspiring full stack developer",
  "phone": "+1234567890",
  "role": "student",
  "enrolledCareers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Full Stack Web Developer",
      "icon": "💻"
    }
  ],
  "completedCourses": [],
  "certificates": []
}
```

**Status Code:** 200

---

### Update Profile
**PUT** `/users/profile`

Update user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "bio": "Full stack developer with 2 years experience",
  "phone": "+1234567890",
  "profileImage": "https://..."
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439002",
  "email": "student@example.com",
  "firstName": "Alice",
  "lastName": "Smith",
  "bio": "Full stack developer with 2 years experience",
  "phone": "+1234567890",
  "role": "student"
}
```

**Status Code:** 200

---

### Enroll in Course
**POST** `/users/enroll`

Enroll user in a course.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439015",
  "careerId": "507f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "message": "Enrolled successfully",
  "enrollment": {
    "_id": "507f1f77bcf86cd799439023",
    "user": "507f1f77bcf86cd799439002",
    "course": "507f1f77bcf86cd799439015",
    "career": "507f1f77bcf86cd799439012",
    "status": "active",
    "enrollmentDate": "2024-01-20T10:30:00Z"
  }
}
```

**Status Code:** 201

---

### Get Enrollments
**GET** `/users/enrollments`

Get user's course enrollments.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439023",
    "user": "507f1f77bcf86cd799439002",
    "course": {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Full Stack Web Developer Masterclass",
      "thumbnail": "https://...",
      "duration": 60,
      "difficulty": "intermediate"
    },
    "career": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Full Stack Web Developer"
    },
    "status": "active",
    "enrollmentDate": "2024-01-20T10:30:00Z"
  }
]
```

**Status Code:** 200

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid email format"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Course not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal server error |

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Authenticated users: 200 requests per 15 minutes

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)

**Example:** `/courses?page=2&limit=10`

**Response includes:**
```json
{
  "data": [],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```
