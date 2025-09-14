import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/context';
import leftStyle from './LeftBar.module.css';

const LeftBar = () => {
  const { logout } = useAuth();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Feed', path: '/feed' },
    { name: 'New Post', path: '/newPost' },
    { name: 'Notifications', path: '/notifications' }, // No path
    { name: 'Friends', path: '/friends' }, // No path
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className={leftStyle.completeBar}>
      <h1 className={leftStyle.leftHeading}>Odling</h1>

      <div className={leftStyle.linksContainer}>
        <ul className={leftStyle.linkList}>
          {links.map(({ name, path }) => (
            <li key={name}>
              {path === '#' ? (
                <span>{name}</span>
              ) : (
                <Link to={path}>{name}</Link>
              )}
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
