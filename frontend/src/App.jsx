// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import RequireAuth from './components/RequireAuth';
import GuestOnly from './components/GuestOnly';
import './style/main.css';

import HeaderLayout from './components/Header/HeaderLayout';
import Home from './pages/dashboard/Home';
import Login from './pages/account/Login';
import Signup from './pages/account/Signup';
import Feed from './components/feed/Feed';
import Profile from './components/profile/Profile';
import EditProfile from './components/editProfile/EditProfile';
import CreatePosts from './components/createPosts/CreatePosts';
import FindUsers from './components/find/FindUsers';
import PublicProfile from './components/profile/PublicProfile';
import PostPage from './components/postCard/PostPage';
import CommentPage from './components/comment/CommentPage';

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

          <Route
            path="/edit"
            element={
              <RequireAuth>
                <EditProfile />
              </RequireAuth>
            }
          />

          <Route
            path="/newPost"
            element={
              <RequireAuth>
                <CreatePosts />
              </RequireAuth>
            }
          />

          <Route
            path="/find"
            element={
              <RequireAuth>
                <FindUsers />
              </RequireAuth>
            }
          />

          <Route
            path="/profile/:id"
            element={
              <RequireAuth>
                <PublicProfile />
              </RequireAuth>
            }
          />

          <Route
            path="/posts/:id"
            element={
              <RequireAuth>
                <PostPage />
              </RequireAuth>
            }
          />

          <Route
            path="/comments/:id"
            element={
              <RequireAuth>
                <CommentPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<div>404</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
