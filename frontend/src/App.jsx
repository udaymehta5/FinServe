import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Analytics from './pages/Analytics';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

// Layout Wrapper for Protected pages
const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-screen text-finText flex relative bg-transparent pb-16 md:pb-0">
      {/* Sidebar Navigation */}
      <Navbar />
      
      {/* Scrollable Content Pane */}
      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />

          {/* Public Authentication Pages */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Secure CFO Dashboard Pages */}
          <Route element={<ProtectedRoute />}>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/about" 
              element={
                <ProtectedLayout>
                  <About />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <ProtectedLayout>
                  <Expenses />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/income" 
              element={
                <ProtectedLayout>
                  <Income />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedLayout>
                  <Analytics />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedLayout>
                  <Chat />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              } 
            />
          </Route>

          {/* Fallback routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global Floating Toast Alert */}
        <Toast />
      </Router>
    </AuthProvider>
  );
};

export default App;
