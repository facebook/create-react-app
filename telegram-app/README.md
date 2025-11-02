# Telegram Clone

A full-stack real-time messaging application built with React, TypeScript, Node.js, Express, and Socket.io.

## Features

- 🔐 User authentication (register/login)
- 💬 Real-time messaging with WebSocket
- 👥 One-on-one and group chats
- 📎 File and image uploads
- ⌨️ Typing indicators
- ✅ Message read receipts
- 🟢 Online/offline status
- 🔍 Search functionality
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Socket.io Client
- Axios
- date-fns

### Backend
- Node.js
- Express
- Socket.io
- TypeScript
- JWT Authentication
- Multer (file uploads)
- bcryptjs (password hashing)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
cd telegram-app
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

### Running the Application

1. Start the server (from the server directory)
```bash
npm run dev
```
The server will run on http://localhost:5000

2. Start the client (from the client directory, in a new terminal)
```bash
npm run dev
```
The client will run on http://localhost:3000

### Building for Production

#### Server
```bash
cd server
npm run build
npm start
```

#### Client
```bash
cd client
npm run build
npm run preview
```

## Project Structure

```
telegram-app/
├── server/
│   ├── src/
│   │   ├── types/          # TypeScript type definitions
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── database.ts     # In-memory database
│   │   └── index.ts        # Server entry point
│   ├── uploads/            # Uploaded files
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── services/       # API and Socket services
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Chats
- `GET /api/chats` - Get all chats for current user
- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id/messages` - Get messages for a chat
- `GET /api/chats/search?q=query` - Search chats

### Upload
- `POST /api/upload` - Upload a file

## WebSocket Events

### Client to Server
- `message:send` - Send a message
- `message:read` - Mark message as read
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator

### Server to Client
- `message:new` - New message received
- `message:read` - Message read status update
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:status` - User online/offline status

## Features in Detail

### Real-time Messaging
Messages are delivered instantly using WebSocket connections. The app maintains persistent connections for real-time updates.

### File Uploads
Users can upload images and files up to 10MB. Supported formats include:
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT, ZIP

### Typing Indicators
See when other users are typing in real-time with animated typing indicators.

### Online Status
User presence is tracked automatically. See who's online and when they were last active.

### Responsive Design
The app works seamlessly on desktop, tablet, and mobile devices.

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected API routes with middleware
- File upload validation and size limits

## Future Enhancements

- [ ] Message editing and deletion
- [ ] Voice messages
- [ ] Video calls
- [ ] Message reactions
- [ ] User profiles with avatars
- [ ] Group chat management
- [ ] Message search
- [ ] Push notifications
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Message encryption

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
