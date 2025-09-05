// src/components/pages/Home.jsx
import { useAuth } from '../../auth/context';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h1>Hello Odling!</h1>
      <p>Welcome {user?.username || user?.name || `User ${user?.id}`}</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
};

export default Home;
