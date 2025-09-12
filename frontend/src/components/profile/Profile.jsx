import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className={styles.loading}>Loading profile…</div>;
  if (!user)
    return <div className={styles.noUser}>No user found. Please log in.</div>;

  const username = user.username || user.name || `User ${user.id}`;

  return (
    <main className={styles.page}>
      <header className={styles.headerCard} aria-label="Profile header">
        <div className={styles.gradientGlow} aria-hidden />
        <div className={styles.headerInner}>
          <div className={styles.avatarWrap}>
            <img
              src={user.profilePic || '/default-avatar.png'}
              alt={username}
              className={styles.avatar}
              loading="lazy"
              width="140"
              height="140"
            />
            <span className={styles.statusPulse} aria-hidden />
          </div>

          <div className={styles.title}>
            <div className={styles.row}>
              <h1 className={styles.username}>{username}</h1>

              <div className={styles.actions}>
                <Link
                  to="/edit"
                  className={styles.editBtn}
                  aria-label="Edit profile"
                >
                  Edit profile
                </Link>

                <Link
                  to="/feed"
                  className={styles.backBtn}
                  aria-label="Go back"
                >
                  ← Back
                </Link>
              </div>
            </div>

            <p className={styles.realName}>{user.name || 'No name set'}</p>
            <p className={styles.bio}>
              {user.bio || 'This user has no bio yet.'}
            </p>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <div className={styles.metaNum}>0</div>
                <div className={styles.metaLabel}>Posts</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaNum}>—</div>
                <div className={styles.metaLabel}>Followers</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaNum}>—</div>
                <div className={styles.metaLabel}>Following</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>Posts</h2>
        <div className={styles.postsPlaceholder}>
          <p>Posts will appear here — coming soon.</p>
        </div>
      </section>
    </main>
  );
};

export default Profile;
