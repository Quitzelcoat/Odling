import { Link } from 'react-router-dom';
import leftStyle from './LeftBar.module.css';

const LeftBar = () => {
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Feed', path: '/feed' },
    { name: 'Post', path: '/post' },
    { name: 'Search', path: '#' }, // No path
    { name: 'Profile', path: '/profile' },
    { name: 'Logout', path: '/logout' },
  ];

  return (
    <nav className={leftStyle.completeBar}>
      <h1 className={leftStyle.leftHeading}>Odling</h1>
      <ul>
        {links.map(({ name, path }) => (
          <li key={name}>
            {path === '#' ? <span>{name}</span> : <Link to={path}>{name}</Link>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LeftBar;
