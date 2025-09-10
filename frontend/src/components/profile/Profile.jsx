// src/components/profile/Profile.jsx
import React from 'react';
import { useAuth } from '../../auth/context';
import profileStyle from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();

  const username = user?.username || user?.name || `User ${user?.id}`;

  return (
    <main className={profileStyle.container}>
      <section className={profileStyle.header}>
        <div className={profileStyle.avatarWrap}>
          <img
            src={user?.profilePic || '/default-avatar.png'}
            alt={username}
            className={profileStyle.avatar}
          />
        </div>

        <div className={profileStyle.info}>
          <div className={profileStyle.topRow}>
            <h2 className={profileStyle.username}>{username}</h2>

            {/* Edit button - not functional yet per your request */}
            <button className={profileStyle.editBtn} aria-disabled>
              Edit Profile
            </button>
          </div>

          <div className={profileStyle.meta}>
            <div className={profileStyle.realName}>
              {user?.name || 'No name set'}
            </div>
            <div className={profileStyle.bio}>{user?.bio || 'No bio yet.'}</div>
          </div>
        </div>
      </section>

      <section className={profileStyle.posts}>
        <h3>Posts</h3>
        <div className={profileStyle.postsPlaceholder}>
          {/* Leave this area for posts. */}
          <p>Posts will be shown here — coming soon.</p>
        </div>
      </section>
    </main>
  );
};

export default Profile;

/*
OPTIONAL: If later you want to fetch fresh data from the API instead of using `user` in context:
- import useEffect and useState
- call your api.request('/users/me', { token }) from api.js using the token from context
- set local state with the fetched profile and display that
But current approach uses the `user` already loaded in AuthProvider (fast & simple).
*/
