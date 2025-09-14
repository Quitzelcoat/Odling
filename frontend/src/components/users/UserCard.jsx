// src/components/users/UserCard.jsx
import React, { useState } from 'react';
import styles from './UserCard.module.css';
import api from '../../auth/api';
import { useAuth } from '../../auth/context';
import { Link } from 'react-router-dom';

/**
 * Props:
 *  - user: { id, username, name, profilePic, bio }
 *  - token: string (from useAuth)
 *  - initiallyRequested: boolean
 *  - onRequested: callback when request succeeded (optional)
 *  - onCancelled: callback when cancel succeeded (optional)
 */
export default function UserCard({
  user,
  token,
  initiallyRequested = false,
  onRequested,
  onCancelled,
}) {
  const { id, username, name, profilePic, bio } = user;
  const { user: me } = useAuth();
  const [requested, setRequested] = useState(!!initiallyRequested);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendRequest = async () => {
    setLoading(true);
    setError('');
    try {
      await api.request(`/follows/requests/${id}`, { method: 'POST', token });
      setRequested(true);
      if (onRequested) onRequested(id);
    } catch (err) {
      console.error('follow request error', err);
      setError(err?.body?.error || err?.message || 'Could not send request');
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async () => {
    setLoading(true);
    setError('');
    try {
      await api.request(`/follows/requests/${id}`, { method: 'DELETE', token });
      setRequested(false);
      if (onCancelled) onCancelled(id);
    } catch (err) {
      console.error('cancel request error', err);
      setError(err?.body?.error || err?.message || 'Could not cancel request');
    } finally {
      setLoading(false);
    }
  };

  // don't show follow/unfollow UI for yourself
  if (me && me.id === id) {
    return (
      <div className={styles.card}>
        <div className={styles.top}>
          <img
            src={profilePic || '/default-avatar.png'}
            alt={username}
            className={styles.avatar}
          />
          <div className={styles.info}>
            <Link to={`/profile/${id}`} className={styles.name}>
              {username}
            </Link>
            <div className={styles.handle}>{name || '—'}</div>
          </div>
        </div>
        <p className={styles.bio}>{bio || 'No bio yet.'}</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <img
          src={profilePic || '/default-avatar.png'}
          alt={username}
          className={styles.avatar}
          width="72"
          height="72"
        />
        <div className={styles.info}>
          <Link to={`/profile/${id}`} className={styles.name}>
            {username}
          </Link>
          <div className={styles.handle}>{name || '—'}</div>
        </div>

        <div className={styles.actions}>
          {requested ? (
            <button
              className={styles.requestedBtn}
              onClick={cancelRequest}
              disabled={loading}
              title="Cancel follow request"
            >
              {loading ? 'Cancelling…' : 'Requested'}
            </button>
          ) : (
            <button
              className={styles.followBtn}
              onClick={sendRequest}
              disabled={loading}
            >
              {loading ? 'Requesting…' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <p className={styles.bio}>{bio || 'No bio yet.'}</p>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
