import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Friends from './pages/Friends';
import FriendProfile from './pages/FriendProfile';
import Navbar from './components/Navbar';
import PomodoroTimer from './components/PomodoroTimer';
import MotivationalLoader from './components/MotivationalLoader';
import liveUpdates from './utils/liveUpdates';

// Initialize live updates on app start
if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    liveUpdates.initialize().catch(err => {
        console.error('Failed to initialize live updates:', err);
    });
}


const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: 'var(--text-primary)'
            }}>
                Loading...
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: 'var(--text-primary)'
            }}>
                Loading...
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
    const [showLoader, setShowLoader] = React.useState(true);
    const { isAuthenticated } = useAuth();

    React.useEffect(() => {
        // Show loader for 2 seconds on initial load
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Show loader while checking auth or during initial load
    if (showLoader) {
        return <MotivationalLoader maxDuration={2000} />;
    }

    return (
        <NotificationProvider>
            <BrowserRouter>
                <div className="app">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Navbar />
                                <main className="app-main">
                                    <Dashboard />
                                </main>
                            </ProtectedRoute>
                        } />
                        <Route
                            path="/pomodoro"
                            element={
                                <ProtectedRoute>
                                    <PomodoroTimer />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/goals" element={
                            <ProtectedRoute>
                                <Navbar />
                                <main className="app-main">
                                    <Goals />
                                </main>
                            </ProtectedRoute>
                        } />
                        <Route path="/friends" element={
                            <ProtectedRoute>
                                <Navbar />
                                <main className="app-main">
                                    <Friends />
                                </main>
                            </ProtectedRoute>
                        } />
                        <Route path="/friends/:userId" element={
                            <ProtectedRoute>
                                <Navbar />
                                <main className="app-main">
                                    <FriendProfile />
                                </main>
                            </ProtectedRoute>
                        } />

                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </NotificationProvider>
    );
}

export default App;
