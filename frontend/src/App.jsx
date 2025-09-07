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
            {/* add more protected routes here, e.g. <Route path="profile" element={<Profile/>} /> */}
          </Route>

          {/* public routes */}
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

          {/* fallback */}
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
