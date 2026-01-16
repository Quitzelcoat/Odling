// src/pages/profile/Profile.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import styles from './Profile.module.css';
import api from '../../auth/api';
import { makeImageUrl } from '../../auth/urls';

import PostCardWrapper from '../../components/profile/PostCardWraper';
import FollowersModal from '../../components/profile/FollowersModal';

const Profile = () => {
  const { user, loading, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollows, setLoadingFollows] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('followers'); // 'followers' | 'following'

  const fetchFollows = useCallback(async () => {
    if (!user?.id) return;
    setLoadingFollows(true);
    try {
      const [fRes, gRes] = await Promise.all([
        api.request(`/follows/followers/${user.id}`),
        api.request(`/follows/following/${user.id}`),
      ]);
      setFollowers(Array.isArray(fRes.users) ? fRes.users : []);
      setFollowing(Array.isArray(gRes.users) ? gRes.users : []);
    } catch (err) {
      console.error('fetchFollows error', err);
    } finally {
      setLoadingFollows(false);
    }
  }, [user]);

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

  useEffect(() => {
    // fetch followers & following initially
    fetchFollows();

    // refresh when global follow events happen
    const handler = () => fetchFollows();
    window.addEventListener('follows:updated', handler);
    return () => window.removeEventListener('follows:updated', handler);
  }, [fetchFollows]);

  if (loading) return <div className={styles.loading}>Loading profile…</div>;
  if (!user)
    return <div className={styles.noUser}>No user found. Please log in.</div>;

  const username = user.username || user.name || `User ${user.id}`;

  const openModal = (type) => {
    setModalType(type);
    // fetch fresh lists right before opening
    fetchFollows().then(() => setModalOpen(true));
  };

  const closeModal = () => setModalOpen(false);

  // handler for unfollow action from modal (updates DB + local state)
  const handleUnfollow = async (unfollowUserId) => {
    try {
      await api.request(`/follows/${unfollowUserId}`, {
        method: 'DELETE',
        token,
      });
      // remove locally
      setFollowing((prev) => prev.filter((u) => u.id !== unfollowUserId));
      // also notify other pages
      window.dispatchEvent(
        new CustomEvent('follows:updated', {
          detail: { action: 'unfollowed', targetId: unfollowUserId },
        })
      );
    } catch (err) {
      console.error('handleUnfollow error', err);
      // optionally show toast
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.headerCard} aria-label="Profile header">
        <div className={styles.gradientGlow} aria-hidden />
        <div className={styles.headerInner}>
          <div className={styles.avatarWrap}>
            <img
              src={
                user.profilePic
                  ? makeImageUrl(user.profilePic)
                  : '/default-avatar.png'
              }
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

              <button
                className={styles.metaItemButton}
                onClick={() => openModal('followers')}
                aria-label="Open followers"
                title="View followers"
              >
                <div className={styles.metaNum}>
                  {loadingFollows ? '—' : followers.length}
                </div>
                <div className={styles.metaLabel}>Followers</div>
              </button>

              <button
                className={styles.metaItemButton}
                onClick={() => openModal('following')}
                aria-label="Open following"
                title="View following"
              >
                <div className={styles.metaNum}>
                  {loadingFollows ? '—' : following.length}
                </div>
                <div className={styles.metaLabel}>Following</div>
              </button>
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
              You haven’t posted anything. Share your first thought —{' '}
              <Link to="/newPost" className={styles.ctaLink}>
                create a post
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <PostCardWrapper key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <FollowersModal
          open={modalOpen}
          type={modalType}
          onClose={closeModal}
          followers={followers}
          following={following}
          onUnfollow={handleUnfollow}
        />
      )}
    </main>
  );
};

export default Profile;
