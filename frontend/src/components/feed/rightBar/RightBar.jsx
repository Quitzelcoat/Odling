import rightStyle from './RightBar.module.css';
import { useAuth } from '../../../auth/context';

const RightBar = () => {
  const { user } = useAuth();

  const username = user?.username || user?.name || `User ${user?.id}`;

  return (
    <aside className={rightStyle.completeBar}>
      <div className={rightStyle.userInfo}>
        <img
          src={user?.profilePic || '/default-avatar.png'}
          alt={username}
          className={rightStyle.avatar}
        />
        <span className={rightStyle.username}>{username}</span>
      </div>

      <div className={rightStyle.followers}>
        <h3>Followers</h3>
        <ul>
          <li>Follower 1</li>
          <li>Follower 2</li>
          <li>Follower 3</li>
        </ul>
      </div>
    </aside>
  );
};

export default RightBar;
