// src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import signupStyle from './Signup.module.css';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState(null);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.signup({
        username,
        name,
        email,
        password,
        bio,
        dateOfBirth,
        gender,
      });
      navigate('/login');
    } catch (err) {
      setError(err.body?.error || err.message || 'Signup failed');
    }
  };

  return (
    <div className={signupStyle.container}>
      <div className={signupStyle.card}>
        <h2 className={signupStyle.title}>Create account</h2>

        <form className={signupStyle.form} onSubmit={handleSubmit} noValidate>
          <div className={signupStyle.grid}>
            <label className={signupStyle.field}>
              <span className={signupStyle.label}>Username</span>
              <input
                className={signupStyle.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </label>

            <label className={signupStyle.field}>
              <span className={signupStyle.label}>Name</span>
              <input
                className={signupStyle.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>

            <label className={signupStyle.field}>
              <span className={signupStyle.label}>Email</span>
              <input
                className={signupStyle.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
              />
            </label>

            <label className={signupStyle.field}>
              <span className={signupStyle.label}>Password</span>
              <input
                className={signupStyle.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                autoComplete="new-password"
              />
            </label>
          </div>

          <label className={signupStyle.field}>
            <span className={signupStyle.label}>Bio</span>
            <input
              className={signupStyle.input}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio (optional)"
            />
          </label>

          <div className={signupStyle.row}>
            <label className={`${signupStyle.field} ${signupStyle.small}`}>
              <span className={signupStyle.label}>Date of birth</span>
              <input
                className={signupStyle.input}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                type="date"
              />
            </label>

            <label className={`${signupStyle.field} ${signupStyle.small}`}>
              <span className={signupStyle.label}>Gender</span>
              <select
                className={signupStyle.input}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div className={signupStyle.actions}>
            <button className={signupStyle.primary} type="submit">
              Sign up
            </button>{' '}
            <button
              type="button"
              className={signupStyle.linkBtn}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>

          {error && <p className={signupStyle.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
