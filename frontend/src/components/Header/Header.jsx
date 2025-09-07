import { useAuth } from '../../auth/context';
import HeaderStyle from './Header.module.css';

const Header = () => {
  const { logout } = useAuth();

  return (
    <header className={HeaderStyle.fullNav}>
      <div className={HeaderStyle.navContainer}>
        <h1 className={HeaderStyle.logo}>ODLING</h1>
        <nav>
          <ul className={HeaderStyle.navList}>
            <li>Feed</li>
            <li>New Post</li>
            <li>Notification</li>
          </ul>
        </nav>
        <button className={HeaderStyle.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
