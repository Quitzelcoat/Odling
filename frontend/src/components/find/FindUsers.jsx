// src/pages/find/FindUsers.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styles from './FindUsers.module.css';
import feedStyle from '../feed/Feed.module.css'; // reuse container layout
import api from '../../auth/api';
import { useAuth } from '../../auth/context';
import { Link } from 'react-router-dom';

// layout pieces
import UserCard from '../users/UserCard';
import LeftBar from '../feed/leftBar/LeftBar';
import RightBar from '../feed/rightBar/RightBar';
import NotificationProvider from '../notifications/NotificationProvider';
import NotificationSlider from '../notifications/NotificationSlider';

export default function FindUsers() {
  const { user, token } = useAuth();
  const myId = Number(user?.id ?? -1);

  const [query, setQuery] = useState('');
  const [term, setTerm] = useState(''); // debounced term used for API
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  const [requestedIds, setRequestedIds] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [_loadingOutgoing, _setLoadingOutgoing] = useState(true);

  // Debounce input -> setTerm
  useEffect(() => {
    const id = setTimeout(() => setTerm(query.trim()), 350);
    return () => clearTimeout(id);
  }, [query]);

  // load users when term changes
  useEffect(() => {
    let mounted = true;
    async function load() {
      setError('');
      setLoadingUsers(true);
      try {
        const q = term ? `?q=${encodeURIComponent(term)}` : '';
        const data = await api.request(`/users${q}`);
        if (!mounted) return;
        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        console.error('load users error', err);
        setError(err?.body?.error || err?.message || 'Could not load users');
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [term]);

  // load outgoing follow requests to mark requested users
  const loadOutgoing = useCallback(async () => {
    _setLoadingOutgoing(true);
    try {
      const data = await api.request('/follows/requests/outgoing', { token });
      const requests = Array.isArray(data.requests) ? data.requests : [];
      const ids = new Set(
        requests.map((r) => (r.to ? r.to.id : r.toUserId)).filter(Boolean)
      );
      setRequestedIds(ids);
    } catch (err) {
      console.error('load outgoing requests error', err);
    } finally {
      _setLoadingOutgoing(false);
    }
  }, [token]);

  // load following list for the current user
  const loadFollowing = useCallback(async () => {
    try {
      if (!user?.id) {
        setFollowingIds(new Set());
        return;
      }
      const res = await api.request(`/follows/following/${user.id}`);
      const arr = Array.isArray(res.users) ? res.users : [];
      setFollowingIds(new Set(arr.map((u) => u.id)));
    } catch (err) {
      console.error('load following error', err);
      setFollowingIds(new Set());
    }
  }, [user]);

  // initial load of outgoing & following
  useEffect(() => {
    if (token) {
      loadOutgoing();
      loadFollowing();
    } else {
      _setLoadingOutgoing(false);
      setFollowingIds(new Set());
    }
  }, [token, loadOutgoing, loadFollowing]);

  // listen for global follow updates so UI refreshes when accept/reject/unfollow happen
  useEffect(() => {
    const handler = async () => {
      // refresh both sets (outgoing requests and following list)
      await Promise.all([loadOutgoing(), loadFollowing()]);
    };
    window.addEventListener('follows:updated', handler);
    return () => window.removeEventListener('follows:updated', handler);
  }, [loadOutgoing, loadFollowing]);

  // helper to mark requested locally
  const markRequested = (id) =>
    setRequestedIds((prev) => {
      const copy = new Set(prev);
      copy.add(id);
      return copy;
    });

  const markCancelled = (id) =>
    setRequestedIds((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });

  const markFollowed = (id) =>
    setFollowingIds((prev) => {
      const copy = new Set(prev);
      copy.add(id);
      return copy;
    });

  const markUnfollowed = (id) =>
    setFollowingIds((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });

  // filter out self from results (optional)
  const shownUsers = useMemo(
    () => users.filter((u) => Number(u?.id) !== myId),
    [users, myId]
  );

  return (
    <NotificationProvider>
      <div className={feedStyle.container}>
        <LeftBar />

        {/* middle column */}
        <main className={styles.page}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Find people</h1>
              <p className={styles.subtitle}>
                Search users and send follow requests
              </p>
            </div>

            <div className={styles.searchWrap}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username or name"
                className={styles.searchInput}
                aria-label="Search users"
              />
              <Link to="/newPost" className={styles.quickLink}>
                + Post
              </Link>
            </div>
          </header>

          <section className={styles.content}>
            {loadingUsers ? (
              <div className={styles.center}>Searching…</div>
            ) : error ? (
              <div className={styles.centerError}>{error}</div>
            ) : shownUsers.length === 0 ? (
              <div className={styles.empty}>
                <p>No users found.</p>
                <p className={styles.emptyNote}>
                  Try a different search or{' '}
                  <Link to="/newPost">create a post</Link> to get discovered.
                </p>
              </div>
            ) : (
              <div className={styles.grid}>
                {shownUsers.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    token={token}
                    initiallyRequested={requestedIds.has(u.id)}
                    initiallyFollowing={followingIds.has(u.id)}
                    onRequested={() => markRequested(u.id)}
                    onCancelled={() => markCancelled(u.id)}
                    onFollowed={() => markFollowed(u.id)}
                    onUnfollowed={() => markUnfollowed(u.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        <RightBar />
      </div>

      {/* slider overlays the page — keep it outside container so it can float */}
      <NotificationSlider />
    </NotificationProvider>
  );
}
