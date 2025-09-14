// src/components/leftBar/LeftBar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/context';
import leftStyle from './LeftBar.module.css';
import NotificationButton from '../../notifications/NotificationButton';

const LeftBar = () => {
  const { logout } = useAuth();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Feed', path: '/feed' },
    { name: 'New Post', path: '/newPost' },
    { name: 'Friends', path: '/find' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className={leftStyle.completeBar}>
      <h1 className={leftStyle.leftHeading}>Odling</h1>

      {/* Notification bell centered under heading */}
      <div
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}
      >
        <NotificationButton />
      </div>

      <div className={leftStyle.linksContainer}>
        <ul className={leftStyle.linkList}>
          {links.map(({ name, path }) => (
            <li key={name}>
              <Link to={path}>{name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <button className={leftStyle.logoutBtn} onClick={logout}>
        Logout
      </button>
    </nav>
  );
};

export default LeftBar;
