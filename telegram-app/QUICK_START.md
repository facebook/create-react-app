# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies

From the `telegram-app` directory, run:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

Or use the convenience script from the root:
```bash
npm run install:all
```

### Step 2: Start the Server

Open a terminal and run:

```bash
cd server
npm run dev
```

The server will start on **http://localhost:5000**

You should see:
```
Server running on port 5000
```

### Step 3: Start the Client

Open a **new terminal** and run:

```bash
cd client
npm run dev
```

The client will start on **http://localhost:3000**

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

## 🎉 You're Ready!

Open your browser and navigate to **http://localhost:3000**

### First Time Setup

1. **Register an account**
   - Click "Don't have an account? Sign up"
   - Enter a username and password
   - Click "Sign Up"

2. **Create a second user** (to test messaging)
   - Open a new incognito/private browser window
   - Go to http://localhost:3000
   - Register with a different username

3. **Start chatting!**
   - In the first window, click the "+" button
   - Select the second user from the list
   - Start sending messages in real-time!

## 📱 Features to Try

- ✉️ **Send messages** - Type and press Enter or click send
- 📎 **Upload files** - Click the attachment icon to upload images or files
- ⌨️ **Typing indicators** - Start typing to see the typing indicator
- 🟢 **Online status** - See who's online in real-time
- 🔍 **Search** - Use the search bar to find conversations
- 📱 **Responsive** - Resize your browser to see mobile view

## 🛠️ Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

**For Server (port 5000):**
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

**For Client (port 3000):**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### Connection Issues

If the client can't connect to the server:

1. Make sure the server is running on port 5000
2. Check that there are no firewall issues
3. Verify the API URL in `client/src/services/api.ts` is correct
4. Check browser console for errors (F12)

### Build Errors

If you encounter build errors:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Project Structure

```
telegram-app/
├── server/              # Backend Node.js/Express server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth middleware
│   │   ├── types/       # TypeScript types
│   │   ├── database.ts  # In-memory database
│   │   └── index.ts     # Server entry point
│   └── uploads/         # Uploaded files storage
│
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Auth context
│   │   ├── services/    # API & Socket services
│   │   └── types/       # TypeScript types
│   └── public/          # Static assets
│
└── README.md            # Full documentation
```

## 🔧 Development Tips

### Hot Reload

Both server and client support hot reload:
- **Server**: Uses `ts-node` for automatic restart on file changes
- **Client**: Uses Vite's HMR for instant updates

### Debugging

**Server logs:**
- Check the terminal where you ran `npm run dev` in the server directory
- All Socket.io events are logged

**Client logs:**
- Open browser DevTools (F12)
- Check Console tab for logs
- Check Network tab for API calls

### Testing Multiple Users

To test real-time features:
1. Open multiple browser windows (use incognito for different users)
2. Register different accounts in each window
3. Start a conversation and see messages appear instantly!

## 🎨 Customization

### Change Colors

Edit `client/tailwind.config.js`:

```javascript
colors: {
  'telegram-blue': '#0088cc',    // Primary color
  'telegram-dark': '#17212b',    // Dark theme
  'telegram-light': '#2b5278',   // Light accent
}
```

### Change Ports

**Server port:**
Edit `server/src/index.ts`:
```typescript
const PORT = process.env.PORT || 5000;
```

**Client port:**
Edit `client/vite.config.ts`:
```typescript
server: {
  port: 3000,
}
```

## 📖 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the API endpoints
- Check out the WebSocket events
- Customize the UI with Tailwind CSS
- Add new features!

## 💡 Need Help?

- Check the browser console for errors
- Review server logs in the terminal
- Make sure both server and client are running
- Verify all dependencies are installed

Happy coding! 🚀
