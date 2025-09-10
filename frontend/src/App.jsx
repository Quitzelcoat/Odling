// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import RequireAuth from './components/RequireAuth';
import GuestOnly from './components/GuestOnly';
import './style/main.css';

import HeaderLayout from './components/Header/HeaderLayout';
import Home from './components/dashboard/Home';
import Login from './components/account/Login';
import Signup from './components/account/Signup';
import Feed from './components/feed/Feed';
import Profile from './components/profile/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <RequireAuth>
                <HeaderLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Home />} />
          </Route>

          <Route
            path="/login"
            element={
              <GuestOnly>
                <Login />
              </GuestOnly>
            }
          />

          <Route
            path="/signup"
            element={
              <GuestOnly>
                <Signup />
              </GuestOnly>
            }
          />

          <Route
            path="/feed"
            element={
              <RequireAuth>
                <Feed />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* fallback */}
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
