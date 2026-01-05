# GoalTracker - Real-Time Goal & Habit Tracking

A **production-ready**, real-time, friend-based goal and habit tracking web application with offline-first architecture, WebSocket-powered live updates, MongoDB backend, premium UI/UX, and a Pomodoro timer for focused work sessions.

## ✨ Features

### Core Features
- **Real-time Updates**: WebSocket (Socket.IO) powered instant synchronization across all devices
- **Friend System**: Add friends by username/UUID, mutual approval required
- **Goal Types**: One-time, recurring, series, numeric, and percentage-based goals
- **Goal Personalization**: Custom colors and emoji icons for each goal
- **Interactive Calendar**: Monthly view with intelligent progress indicators and streak tracking
- **Social Features**: Comments, emoji reactions, and real-time activity feed
- **Privacy First**: All data private by default, friends get read-only access
- **Pomodoro Timer**: Built-in focus timer with task management and progress tracking

### Premium UX (Phases 1-6)
- **📱 Fully Responsive Design**: Mobile-first with hamburger menu, optimized touch targets (44px+), and adaptive layouts
- **🍔 Mobile Navigation**: Slide-in menu drawer with smooth animations and backdrop overlay
- **🌓 Dark/Light Mode**: Seamless theme switching with localStorage persistence
- **💾 Offline-First**: Works completely offline with automatic sync when online
- **🎉 Micro-Celebrations**: Confetti animations on milestones and achievements
- **🔥 Streak Tracking**: Server-validated streaks with milestone badges (3, 7, 30 days)
- **📊 Daily Progress Bar**: Visual timeline showing today's completion rate
- **⚡ Quick Actions**: One-click buttons for common progress updates (+10%, Mark Done, Reset)
- **🎨 Loading Skeletons**: Premium shimmer effects instead of loading spinners
- **🔔 Toast Notifications**: Non-intrusive feedback for all actions
- **📈 Calendar Intelligence**: 
  - Gradient backgrounds based on completion %
  - Status icons (🔥 streak, ⭐ perfect day, ⚠️ missed)
  - Hover tooltips with progress details
  - Future days greyed out
- **🎯 Empty States**: Helpful messages and CTAs for new users
- **⏱️ Pomodoro Focus Mode**: 
  - 25/5/15 minute timer cycles (work/short break/long break)
  - Task integration with completion tracking
  - Circular progress indicator
  - Browser notifications
  - Session statistics
  - Mobile-optimized responsive layout

### Responsive Design Highlights
- **Desktop (>768px)**: Horizontal navigation, max-width 1400px, 15px base font
- **Tablet (768px)**: Single-column layouts, hamburger menu
- **Mobile (<768px)**: 13px base font, slide-in navigation, stacked layouts
- **Small Mobile (<480px)**: Optimized spacing, hidden non-essential elements
- **Touch Targets**: Minimum 44px height for all interactive elements (WCAG 2.1 compliant)

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- Socket.IO (WebSockets for real-time)
- MongoDB + Mongoose (with string-based dates for timezone safety)
- JWT Authentication (httpOnly cookies)
- bcryptjs for password hashing
- Calendar API with streak calculation
- express-rate-limit for API protection

### Frontend
- React 18 with Hooks
- Vite (fast build tool)
- Socket.IO Client (real-time updates)
- **react-hot-toast** (toast notifications)
- **react-loading-skeleton** (loading states)
- **canvas-confetti** (celebrations)
- Chart.js (analytics)
- date-fns (date utilities)
- Axios (HTTP client with offline queue)
- Vanilla CSS with CSS custom properties

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
│   │   │   ├── Navbar.jsx         # Mobile-responsive navigation
│   │   │   ├── Calendar.jsx       # Interactive calendar
│   │   │   ├── DayModal.jsx       # Day detail modal
│   │   │   ├── PomodoroTimer.jsx  # Focus timer (mobile-optimized)
│   │   │   ├── ActivityFeed.jsx   # Social activity feed
│   │   │   └── ...
│   │   ├── pages/       # Page components
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Goals.jsx      # Goals management
│   │   │   ├── Friends.jsx    # Friends list
│   │   │   └── ...
│   │   ├── context/     # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── utils/       # Utilities
│   │   ├── hooks/       # Custom React hooks
│   │   ├── index.css    # Global responsive styles
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

### Calendar & Streaks
- `GET /api/calendar/day/:date` - Get daily summary with streak count
- `GET /api/calendar/month?year=2026&month=01` - Get month summary with flags

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

## 🎯 Recent Enhancements (2026)

### Phase 1: Critical Fixes & Core UX
- ✅ **Date Timezone Fix**: Tasks now save to correct day (string-based dates)
- ✅ **Responsive Design**: Mobile-first with breakpoints for all devices
- ✅ **Auto-Refresh**: Dashboard refreshes every 30s when tab is active
- ✅ **Calendar Intelligence**: Gradient backgrounds, status icons, tooltips
- ✅ **Quick Actions**: One-click progress buttons in day modal

### Phase 2: Premium UI Refinements
- ✅ **App Shell**: Consistent layout wrapper across all pages
- ✅ **Calm Interactions**: Subtle hover effects, button press feedback
- ✅ **Intent Highlights**: Visual cues for at-risk and streak goals
- ✅ **Animated Numbers**: Smooth transitions on progress updates
- ✅ **Visual Hierarchy**: Clear date/meta structure in calendar cells
- ✅ **Today Focus**: Highlighted current day in calendar
- ✅ **Empty States**: Helpful messages for new users
- ✅ **Daily Progress Bar**: Prominent completion tracker on dashboard

### Phase 3: Offline-First Architecture
- ✅ **Offline Detection**: Real-time online/offline status badge
- ✅ **Action Queue**: localStorage-based queue for offline actions
- ✅ **Auto-Sync**: Automatic sync when connection restored
- ✅ **Retry Logic**: 3 attempts before marking failed
- ✅ **Visual Feedback**: Pending sync count and status indicators

### Phase 4: Micro-Celebrations
- ✅ **Confetti**: Celebration animations on 100% completion
- ✅ **Streak Badges**: Milestone badges (🔥 3 days, ⭐ 7 days, 💎 30 days)
- ✅ **Success Animations**: Subtle pulse effects on achievements
- ✅ **Motivational Messages**: Context-aware encouragement

### Phase 5: Backend Calendar API
- ✅ **Daily Summary Endpoint**: Completion stats + streak validation
- ✅ **Month Summary Endpoint**: Calendar data with flags (perfect/missed/streak)
- ✅ **Streak Calculator**: Server-side streak validation (no cheating!)
- ✅ **Performance**: Optimized queries with proper indexing

### Phase 6: Advanced Features & Responsive Overhaul
- ✅ **Pomodoro Timer**: Full-featured focus mode with task integration
  - 25/5/15 minute customizable timers
  - Circular SVG progress indicator with gradient animation
  - Task management and completion tracking
  - Session statistics and pomodoro counting
  - Desktop keyboard shortcuts (Space, R, T, Esc)
  - Browser notifications on timer completion
  - Theme-aware color schemes for different modes
  - Mobile-optimized with responsive layouts
  - Collapsible task sidebar (desktop) / bottom panel (mobile)
  
- ✅ **Mobile Responsiveness Overhaul**:
  - **Font Size Optimization**: Reduced from 16px → 15px (desktop), 13px (mobile)
  - **Hamburger Navigation**: Slide-in menu from right with backdrop overlay
  - **Touch Target Compliance**: All buttons minimum 44px height on mobile
  - **Responsive Breakpoints**:
    - Large Desktop (1441px+): Constrained scaling
    - Desktop (768px-1440px): Full features, horizontal nav
    - Tablet (768px): Hamburger menu activation
    - Mobile (<768px): Stacked layouts, optimized spacing
    - Small Mobile (<480px): Compact UI, hidden non-essentials
  - **Component Optimizations**:
    - Dashboard: Flexible header wrapping, compact badges
    - Calendar: Reduced grid gaps (3px), increased tap targets (48px)
    - Navbar: Mobile menu with theme toggle and logout
    - ActivityFeed: Better text wrapping, flex-shrink controls
    - Pomodoro: Column layout on mobile, reduced timer size (280px)
  - **Utility Classes**: `.mobile-only` and `.desktop-only` for conditional rendering
  
- ✅ **Weekly Review & Insights**: Data-driven progress analytics
- ✅ **Inline Editing**: Quick edit goals without modal
- ✅ **Public Read-Only Profiles**: Share progress with non-friends
- ✅ **Rate Limiting**: API protection with express-rate-limit

### Quick Wins (Latest)
- ✅ **Dark/Light Mode**: Theme toggle with localStorage persistence
- ✅ **Toast Notifications**: Replaced alerts with elegant toasts
- ✅ **Goal Colors/Icons**: Personalize goals with colors and emojis
- ✅ **Loading Skeletons**: Premium shimmer effects while loading
- ✅ **CORS Fix**: Multi-port support for Vite (5173, 5174)
- ✅ **Mobile Menu**: Hamburger navigation with smooth animations
- ✅ **Viewport Constraints**: max-width 1400px to prevent over-zooming

## � Mobile Testing

### Recommended Test Viewports
- **iPhone SE**: 375x667px
- **iPhone 12 Pro**: 390x844px
- **Samsung Galaxy S21**: 360x800px
- **iPad Mini**: 768x1024px
- **Desktop**: 1920x1080px

### Testing Checklist
- [ ] Hamburger menu appears at ≤768px width
- [ ] All buttons are tappable (≥44px)
- [ ] No horizontal scrolling on any viewport
- [ ] Text is readable at all sizes
- [ ] Calendar days have adequate tap targets
- [ ] Pomodoro timer adapts to mobile layout
- [ ] Modals fit within viewport
- [ ] Theme toggle works in mobile menu

## ⌨️ Keyboard Shortcuts

### Pomodoro Timer (Desktop only)
- `Space` - Start/Pause timer
- `R` - Reset current timer
- `T` - Toggle tasks sidebar
- `Esc` - Exit Pomodoro mode

## �🔒 Security Notes

- Change `JWT_SECRET` in production
- Use environment variables for sensitive data
- Enable CORS only for trusted domains
- Use HTTPS in production
- Keep dependencies updated
- Rate limiting enabled on all API routes

## 🎨 Design Philosophy

- **Mobile-First**: Designed for mobile, enhanced for desktop
- **Touch-Friendly**: Minimum 44px touch targets throughout
- **Performance**: Lazy loading, optimized assets, efficient re-renders
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Consistency**: Design system with CSS custom properties
- **Responsiveness**: Fluid typography and adaptive layouts

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Node.js, React, and MongoDB | Fully responsive and offline-capable
