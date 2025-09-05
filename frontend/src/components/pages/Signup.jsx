// src/components/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context';

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
      // on success navigate to login (or auto-login if you prefer)
      navigate('/login');
    } catch (err) {
      setError(err.body?.error || err.message || 'Signup failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <div>
          <label>Bio</label>
          <input value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <label>Date of birth</label>
          <input
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            type="date"
          />
        </div>
        <div>
          <label>Gender</label>
          <input value={gender} onChange={(e) => setGender(e.target.value)} />
        </div>
        <button type="submit">Sign up</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
