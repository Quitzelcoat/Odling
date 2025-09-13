import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import styles from './Profile.module.css';
import api from '../../auth/api';

// adjust this path if your PostCard lives elsewhere:
import PostCard from '../postCard/PostCard';

const Profile = () => {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadPosts = async () => {
      if (!user) return;
      setPostsError('');
      setLoadingPosts(true);
      try {
        const data = await api.request('/posts');
        if (!mounted) return;
        const all = Array.isArray(data.posts) ? data.posts : [];
        // Filter for posts authored by this user (non-deleted per API)
        const mine = all.filter((p) => p.author && p.author.id === user.id);
        setPosts(mine);
      } catch (err) {
        console.error('Failed loading profile posts', err);
        setPostsError(
          err?.body?.error || err?.message || 'Could not load posts'
        );
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };

    loadPosts();
    return () => {
      mounted = false;
    };
  }, [user]);

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
                <div className={styles.metaNum}>{posts.length}</div>
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

        {loadingPosts ? (
          <div className={styles.postsPlaceholder}>
            <p>Loading posts…</p>
          </div>
        ) : postsError ? (
          <div className={styles.postsPlaceholder}>
            <p className={styles.errorText}>{postsError}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.postsPlaceholder}>
            <p className={styles.noPostsTitle}>No posts yet</p>
            <p className={styles.noPostsNote}>
              You haven’t posted anything. Share your first thought —
              <Link to="/newPost" className={styles.ctaLink}>
                {' '}
                create a post
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <div key={post.id} className={styles.postWrap}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Profile;
