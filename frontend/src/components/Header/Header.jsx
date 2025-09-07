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
            <li>
              <a href="/feed">Feed</a>
            </li>
            <li>
              <a>New Post</a>
            </li>
            <li>
              <a>Search</a>
            </li>
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
