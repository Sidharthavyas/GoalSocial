import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Friends from './pages/Friends';
import FriendProfile from './pages/FriendProfile';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="loading text-lg">Loading...</div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="loading text-lg">Loading...</div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
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
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/goals" element={
                        <ProtectedRoute>
                            <Navbar />
                            <Goals />
                        </ProtectedRoute>
                    } />
                    <Route path="/friends" element={
                        <ProtectedRoute>
                            <Navbar />
                            <Friends />
                        </ProtectedRoute>
                    } />
                    <Route path="/friends/:userId" element={
                        <ProtectedRoute>
                            <Navbar />
                            <FriendProfile />
                        </ProtectedRoute>
                    } />

                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
