# GoalSocial - Social Goal Tracking App

A real-time, social goal tracking application built with React, Node.js, and MongoDB. Track your goals, connect with friends, and stay motivated together!

## 🌟 Features

### Core Features
- **Goal Management**: Create and track one-time, recurring, series, numeric, and percentage-based goals
- **Calendar View**: Visual calendar with goal completion tracking
- **Real-time Updates**: WebSocket-powered live updates across all features
- **Friend System**: Connect with friends and see their progress
- **Activity Feed**: Stay updated with friends' achievements
- **Progress Analytics**: Detailed charts and statistics (weekly, monthly, yearly)
- **Streak Tracking**: Build and maintain daily streaks
- **Pomodoro Timer**: Built-in focus mode with 3D rotating object
- **Dark/Light Theme**: Beautiful theme switching
- **Mobile Responsive**: Fully optimized for mobile devices

### Social Features
- Friend requests and management
- Public read-only profiles
- Activity feed with real-time updates
- Comments and emoji reactions
- Friend online status

### Smart Notifications
- Daily goal reminders
- Streak rescue alerts (Duolingo-style)
- Friend activity notifications
- Perfect day achievements
- Customizable notification preferences

### Mobile App
- **Android APK**: Native Android app via Capacitor
- **Push Notifications**: Real-time mobile notifications
- **Offline Support**: Work offline with auto-sync
- **Responsive Design**: Touch-optimized interface

## 🚀 Tech Stack

### Frontend
- **React** (Vite) - Fast, modern UI
- **React Router** - Client-side routing
- **Chart.js** - Beautiful analytics charts
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP requests
- **Capacitor** - Mobile app framework
- **React Loading Skeleton** - Loading states

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Node-cron** - Scheduled notifications

### Deployment
- **Frontend**: Vercel (Web) + Android APK
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📱 Live Demo

- **Web App**: [https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)
- **Backend API**: [https://your-render-url.onrender.com](https://your-render-url.onrender.com)
- **Android APK**: Available in releases

## 🛠️ Installation

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm start
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

### Mobile App Setup

```bash
cd frontend

# Build web assets
npm run build

# Sync with Capacitor
npm run cap:sync:android

# Open in Android Studio
npm run cap:open:android
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend
Update API URLs in `src/utils/api.js` and `src/context/SocketContext.jsx`

## 📂 Project Structure

```
GoalSocial/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS files
│   ├── public/             # Static assets
│   └── android/            # Capacitor Android project
├── backend/
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
└── README.md
```

## 🎯 Key Features Explained

### Goal Types
1. **One-time**: Complete once (e.g., "Read a book")
2. **Recurring**: Daily/weekly tasks (e.g., "Exercise")
3. **Series**: Multi-step goals (e.g., "30-day challenge")
4. **Numeric**: Track numbers (e.g., "Drink 8 glasses of water")
5. **Percentage**: Progress-based (e.g., "Complete 75% of tasks")

### Real-time Features
- Instant goal updates across devices
- Live friend activity feed
- Real-time notifications
- WebSocket-powered sync

### Analytics
- Weekly completion trends
- Monthly progress charts
- Yearly overview
- Streak statistics
- Perfect day tracking

### Mobile Optimizations
- 44px minimum touch targets
- Responsive typography (16px base)
- Optimized layouts for small screens
- Native Android app with push notifications
- Offline support with auto-sync

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Input validation
- Rate limiting

## 📊 Performance

- Lazy loading components
- Optimized re-renders with React.memo
- Efficient WebSocket connections
- Indexed MongoDB queries
- Client-side caching
- Skeleton loading states

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Duolingo's engagement patterns
- Design influenced by modern productivity apps
- Built with love for the productivity community

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ by Sidhartha Vyas**
