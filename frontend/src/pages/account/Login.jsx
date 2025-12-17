// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import loginStyle from './Login.module.css';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.login({ emailOrUsername, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.body?.error || err.message || 'Login failed');
    }
  };

  const handleGuest = async () => {
    setError(null);
    try {
      await auth.guestSignIn();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('guest sign-in error', err);
      setError(
        err?.body?.error || err?.message || 'Could not sign in as guest'
      );
    }
  };

  return (
    <div className={loginStyle.container}>
      <div className={loginStyle.card}>
        <h2 className={loginStyle.title}>Welcome back</h2>

        <form className={loginStyle.form} onSubmit={handleSubmit} noValidate>
          <label className={loginStyle.field}>
            <span className={loginStyle.label}>Email or username</span>
            <input
              className={loginStyle.input}
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className={loginStyle.field}>
            <span className={loginStyle.label}>Password</span>
            <input
              className={loginStyle.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <div className={loginStyle.actions}>
            <button className={loginStyle.primary} type="submit">
              Log in
            </button>
            <button
              type="button"
              className={loginStyle.linkBtn}
              onClick={() => navigate('/signup')}
            >
              Create account
            </button>

            {/* NEW: Continue as guest */}
            <button
              type="button"
              className={loginStyle.linkBtn}
              onClick={handleGuest}
            >
              Continue as guest
            </button>
          </div>

          {error && <p className={loginStyle.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
