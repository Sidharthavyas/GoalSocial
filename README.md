# GoalTracker - Real-Time Goal & Habit Tracking

A real-time, friend-based goal and habit tracking web application with WebSocket-powered live updates, MongoDB backend, and JWT authentication.

## 🚀 Features

- **Real-time Updates**: WebSocket (Socket.IO) powered instant synchronization
- **Friend System**: Add friends by username/UUID, mutual approval required
- **Goal Types**: One-time, recurring, series, numeric, and percentage-based goals
- **Interactive Calendar**: Monthly view with progress indicators
- **Social Features**: Comments, emoji reactions, activity feed
- **Privacy First**: All data private by default, friends get read-only access
- **Mobile-First**: Responsive design optimized for all devices
- **Dark Mode**: Premium glassmorphism UI

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- Socket.IO (WebSockets)
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- Vite
- Socket.IO Client
- Chart.js (for analytics)
- date-fns (date utilities)
- Axios (HTTP client)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gt2
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/goaltracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

### 4. MongoDB Setup

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service: `mongod`

**Option B: MongoDB Atlas (Free Tier)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at: http://localhost:5173

## 📡 WebSocket Events

### Server → Client Events
- `user.online` - Friend comes online
- `user.offline` - Friend goes offline
- `friend.accepted` - Friend request accepted
- `friend.requested` - New friend request received
- `goal.created` - Friend creates a goal
- `goal.updated` - Friend updates a goal
- `goal.deleted` - Friend deletes a goal
- `progress.updated` - Friend updates progress
- `comment.created` - New comment on your content
- `reaction.created` - New reaction on your content
- `activity.new` - New activity from friends

### Client → Server Events
- `authenticate` - Authenticate WebSocket connection
- `goal.create` - Create a new goal
- `goal.update` - Update existing goal
- `goal.delete` - Delete a goal
- `progress.update` - Update daily progress
- `comment.add` - Add a comment
- `reaction.add` - Add a reaction

## 🗂️ Project Structure

```
gt2/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # REST API endpoints
│   ├── middleware/      # Auth middleware
│   ├── events/          # WebSocket handlers
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   ├── utils/       # Utilities
│   │   ├── api/         # API functions
│   │   └── App.jsx      # Main app component
│   └── index.html
└── README.md
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/:userId/goals` - Get user's goals (if friend)

### Friends
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/:requestId` - Accept request
- `POST /api/friends/reject/:requestId` - Reject request
- `GET /api/friends` - Get friends list
- `GET /api/friends/pending` - Get pending requests
- `DELETE /api/friends/:friendshipId` - Remove friend

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get user's goals
- `GET /api/goals/:goalId` - Get specific goal
- `PUT /api/goals/:goalId` - Update goal
- `DELETE /api/goals/:goalId` - Delete goal

### Tasks
- `POST /api/tasks` - Create/update task
- `GET /api/tasks?date=YYYY-MM-DD` - Get tasks by date
- `GET /api/tasks?goalId=xxx` - Get tasks by goal
- `GET /api/tasks/:taskId` - Get specific task

### Social
- `POST /api/comments` - Add comment
- `GET /api/comments?targetType=goal&targetId=xxx` - Get comments
- `POST /api/reactions` - Add/update reaction
- `DELETE /api/reactions/:reactionId` - Remove reaction
- `GET /api/reactions?targetType=goal&targetId=xxx` - Get reactions
- `GET /api/activity` - Get activity feed

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Create account on Railway.app or Render.com
2. Connect your repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Create account on Vercel or Netlify
2. Connect your repository
3. Set build command: `npm run build`
4. Set environment variables
5. Deploy

### MongoDB Atlas

1. Create MongoDB Atlas account
2. Create cluster
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string
5. Update backend environment variables

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use environment variables for sensitive data
- Enable CORS only for trusted domains
- Use HTTPS in production
- Keep dependencies updated

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Node.js, React, and MongoDB
