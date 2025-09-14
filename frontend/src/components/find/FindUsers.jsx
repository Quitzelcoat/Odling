// src/pages/find/FindUsers.jsx
import React, { useEffect, useMemo, useState } from 'react';
import styles from './FindUsers.module.css';
import feedStyle from '../feed/Feed.module.css'; // reuse container layout
import api from '../../auth/api';
import { useAuth } from '../../auth/context';
import UserCard from '..//users/UserCard';
import { Link } from 'react-router-dom';

// layout pieces
import LeftBar from '../feed/leftBar/LeftBar';
import RightBar from '../feed/rightBar/RightBar';
import NotificationProvider from '../notifications/NotificationProvider';
import NotificationSlider from '../notifications/NotificationSlider';

export default function FindUsers() {
  const { user, token } = useAuth();
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState(''); // debounced term used for API
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  const [requestedIds, setRequestedIds] = useState(new Set());
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
  useEffect(() => {
    let mounted = true;
    async function loadOutgoing() {
      _setLoadingOutgoing(true);
      try {
        const data = await api.request('/follows/requests/outgoing', { token });
        if (!mounted) return;
        const requests = Array.isArray(data.requests) ? data.requests : [];
        const ids = new Set(
          requests.map((r) => (r.to ? r.to.id : null)).filter(Boolean)
        );
        setRequestedIds(ids);
      } catch (err) {
        console.error('load outgoing requests error', err);
      } finally {
        if (mounted) _setLoadingOutgoing(false);
      }
    }
    if (token) loadOutgoing();
    else _setLoadingOutgoing(false);
    return () => {
      mounted = false;
    };
  }, [token]);

  // helper to mark requested locally
  const markRequested = (id) => {
    setRequestedIds((prev) => new Set(prev).add(id));
  };

  // filter out self from results (optional)
  const shownUsers = useMemo(() => {
    const myId = Number(user?.id ?? -1);
    return users.filter((u) => Number(u?.id) !== myId);
  }, [users, user]);

  // --- layout: use Feed.module.css container so leftbar appears the same ---
  return (
    <NotificationProvider>
      <div className={feedStyle.container}>
        <LeftBar />

        {/* middle column: keep your original page content here */}
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
                    onRequested={() => markRequested(u.id)}
                    onCancelled={() =>
                      setRequestedIds((prev) => {
                        const copy = new Set(prev);
                        copy.delete(u.id);
                        return copy;
                      })
                    }
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
