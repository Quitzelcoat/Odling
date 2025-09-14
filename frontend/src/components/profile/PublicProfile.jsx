/* eslint-disable no-unused-vars */
// src/pages/profile/PublicProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../auth/api';
import { useAuth } from '../../auth/context';
import styles from './PublicProfile.module.css';

// Reuse your PostCard component (path may vary)
import PostCard from '../postCard/PostCard';

export default function PublicProfile() {
  const { id: paramId } = useParams(); // route: /profile/:id
  const userId = parseInt(paramId, 10);

  const { user: me, token } = useAuth();
  const meId = me?.id;

  const [target, setTarget] = useState(null);
  const [loadingTarget, setLoadingTarget] = useState(true);
  const [targetError, setTargetError] = useState('');

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);

  const [outgoingRequested, setOutgoingRequested] = useState(false);
  const [loadingOutgoing, setLoadingOutgoing] = useState(true);

  const [actionState, setActionState] = useState({
    loading: false,
    error: '',
    // this will be true when follow relationship exists
    following: false,
    // when a request has been sent (pending)
    requested: false,
  });

  // load target user info
  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      setTargetError('');
      setLoadingTarget(true);
      try {
        const data = await api.request(`/users/${userId}`);
        if (!mounted) return;
        setTarget(data.user || data); // controller might return { user } or user
      } catch (err) {
        console.error('load user error', err);
        setTargetError(
          err?.body?.error || err?.message || 'Could not load user'
        );
      } finally {
        if (mounted) setLoadingTarget(false);
      }
    }
    if (!Number.isNaN(userId)) loadUser();
    else setTargetError('Invalid user id');
    return () => (mounted = false);
  }, [userId]);

  // load all posts and filter for this author
  useEffect(() => {
    let mounted = true;
    async function loadPosts() {
      setLoadingPosts(true);
      try {
        const data = await api.request('/posts');
        if (!mounted) return;
        const all = Array.isArray(data.posts) ? data.posts : [];
        const mine = all.filter((p) => p.author && p.author.id === userId);
        setPosts(mine);
      } catch (err) {
        console.error('load posts error', err);
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    }
    loadPosts();
    return () => (mounted = false);
  }, [userId]);

  // load followers & following counts + determine if current user is following
  useEffect(() => {
    let mounted = true;
    async function loadFollows() {
      setLoadingFollowers(true);
      try {
        const [fRes, gRes] = await Promise.all([
          api.request(`/follows/followers/${userId}`),
          api.request(`/follows/following/${userId}`),
        ]);
        if (!mounted) return;
        const fUsers = Array.isArray(fRes.users) ? fRes.users : [];
        const gUsers = Array.isArray(gRes.users) ? gRes.users : [];
        setFollowers(fUsers);
        setFollowing(gUsers);

        const amFollowing = !!fUsers.find((u) => u.id === meId);
        setActionState((s) => ({ ...s, following: amFollowing }));
      } catch (err) {
        console.error('load follows error', err);
      } finally {
        if (mounted) setLoadingFollowers(false);
      }
    }
    if (!Number.isNaN(userId)) loadFollows();
    return () => (mounted = false);
  }, [userId, meId]);

  // load outgoing follow requests for current user to check if a request to this target exists
  useEffect(() => {
    let mounted = true;
    async function loadOutgoing() {
      setLoadingOutgoing(true);
      try {
        const res = await api.request('/follows/requests/outgoing', { token });
        if (!mounted) return;
        const requests = Array.isArray(res.requests) ? res.requests : [];
        const has = requests.some((r) => {
          const to = r.to || r.toUserId || null;
          return (to && to.id === userId) || r.toUserId === userId;
        });
        setOutgoingRequested(has);
        setActionState((s) => ({ ...s, requested: has }));
      } catch (err) {
        console.error('load outgoing error', err);
      } finally {
        if (mounted) setLoadingOutgoing(false);
      }
    }

    if (token) loadOutgoing();
    else {
      setLoadingOutgoing(false);
      setOutgoingRequested(false);
      setActionState((s) => ({ ...s, requested: false }));
    }
    return () => (mounted = false);
  }, [userId, token]);

  // Derived states for rendering
  const isMe = meId && meId === userId;
  const postsCount = posts.length;
  const followersCount = followers.length;
  const followingCount = following.length;

  // Action handlers
  const sendRequest = async () => {
    setActionState((s) => ({ ...s, loading: true, error: '' }));
    try {
      await api.request(`/follows/requests/${userId}`, {
        method: 'POST',
        token,
      });
      setActionState((s) => ({ ...s, requested: true, loading: false }));
    } catch (err) {
      console.error('send request error', err);
      setActionState((s) => ({
        ...s,
        error: err?.body?.error || err?.message || 'Could not send request',
        loading: false,
      }));
    }
  };

  const cancelRequest = async () => {
    setActionState((s) => ({ ...s, loading: true, error: '' }));
    try {
      await api.request(`/follows/requests/${userId}`, {
        method: 'DELETE',
        token,
      });
      setActionState((s) => ({ ...s, requested: false, loading: false }));
    } catch (err) {
      console.error('cancel request error', err);
      setActionState((s) => ({
        ...s,
        error: err?.body?.error || err?.message || 'Could not cancel request',
        loading: false,
      }));
    }
  };

  const doUnfollow = async () => {
    setActionState((s) => ({ ...s, loading: true, error: '' }));
    try {
      await api.request(`/follows/${userId}`, { method: 'DELETE', token });
      setActionState((s) => ({ ...s, following: false, loading: false }));
      // update follower list locally
      setFollowers((prev) => prev.filter((u) => u.id !== meId));
    } catch (err) {
      console.error('unfollow error', err);
      setActionState((s) => ({
        ...s,
        error: err?.body?.error || err?.message || 'Could not unfollow',
        loading: false,
      }));
    }
  };

  // Render action button depending on state
  function ActionButton() {
    if (!token) {
      // logged out users see a prompt to login (or follow disabled)
      return (
        <Link to="/auth/login" className={styles.followBtn}>
          Login to follow
        </Link>
      );
    }

    if (isMe) return null; // don't show follow controls on own profile (keep edit flow elsewhere)

    // prefer specific actionState flags
    const { loading, following: isFollowing, requested } = actionState;

    if (loading) {
      return (
        <button className={styles.ghostBtn} disabled>
          Processing…
        </button>
      );
    }

    if (isFollowing) {
      return (
        <button className={styles.followingBtn} onClick={doUnfollow}>
          Following — Unfollow
        </button>
      );
    }

    if (requested) {
      return (
        <div className={styles.requestWrap}>
          <button className={styles.requestedBtn} disabled>
            Requested
          </button>
          <button
            className={styles.cancelBtn}
            onClick={cancelRequest}
            title="Cancel request"
          >
            Cancel
          </button>
        </div>
      );
    }

    // default
    return (
      <button className={styles.followBtn} onClick={sendRequest}>
        Follow
      </button>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.headerCard} aria-label="Profile header">
        <div className={styles.gradientGlow} aria-hidden />
        <div className={styles.headerInner}>
          <div className={styles.avatarWrap}>
            <img
              src={(target && target.profilePic) || '/default-avatar.png'}
              alt={(target && (target.username || target.name)) || 'user'}
              className={styles.avatar}
              loading="lazy"
              width="140"
              height="140"
            />
            <span className={styles.statusPulse} aria-hidden />
          </div>

          <div className={styles.title}>
            <div className={styles.row}>
              <h1 className={styles.username}>
                {(target && (target.username || target.name)) || 'User'}
              </h1>

              <div className={styles.actions}>
                <ActionButton />
                <Link
                  to="/feed"
                  className={styles.backBtn}
                  aria-label="Go back"
                >
                  ← Back
                </Link>
              </div>
            </div>

            <p className={styles.realName}>{(target && target.name) || '—'}</p>
            <p className={styles.bio}>
              {(target && target.bio) || 'This user has no bio yet.'}
            </p>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <div className={styles.metaNum}>
                  {loadingPosts ? '—' : postsCount}
                </div>
                <div className={styles.metaLabel}>Posts</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaNum}>
                  {loadingFollowers ? '—' : followersCount}
                </div>
                <div className={styles.metaLabel}>Followers</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaNum}>
                  {loadingFollowers ? '—' : followingCount}
                </div>
                <div className={styles.metaLabel}>Following</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>
          {(target && (target.username || target.name)) || 'Posts'}
        </h2>

        {loadingPosts ? (
          <div className={styles.postsPlaceholder}>Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className={styles.postsPlaceholder}>
            <p>No posts yet.</p>
            <p className={styles.postsNote}>
              When this user posts, you'll see their posts here.
            </p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((p) => (
              <div key={p.id} className={styles.postWrap}>
                <PostCard post={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
