// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
  });
  const [err, setErr] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      await signup(form);
      // after signup, you might want to redirect to login
      navigate('/login');
    } catch (error) {
      setErr(error.message || 'Signup failed');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <form onSubmit={onSubmit}>
        <input
          name="username"
          placeholder="username"
          value={form.username}
          onChange={onChange}
        />
        <br />
        <input
          name="name"
          placeholder="name"
          value={form.name}
          onChange={onChange}
        />
        <br />
        <input
          name="email"
          placeholder="email"
          value={form.email}
          onChange={onChange}
        />
        <br />
        <input
          name="password"
          type="password"
          placeholder="password"
          value={form.password}
          onChange={onChange}
        />
        <br />
        <input
          name="bio"
          placeholder="bio"
          value={form.bio}
          onChange={onChange}
        />
        <br />
        <input
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={onChange}
        />
        <br />
        <input
          name="gender"
          placeholder="gender"
          value={form.gender}
          onChange={onChange}
        />
        <br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}
