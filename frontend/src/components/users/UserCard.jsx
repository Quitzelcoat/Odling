// src/components/users/UserCard.jsx
import React, { useEffect, useState } from 'react';
import styles from './UserCard.module.css';
import api from '../../auth/api';
import { Link } from 'react-router-dom';
import { makeImageUrl } from '../../auth/urls';

export default function UserCard({
  user,
  token,
  initiallyRequested = false,
  initiallyFollowing = false,
  onRequested,
  onCancelled,
  onUnfollowed,
}) {
  const { id, username, name, profilePic, bio } = user;

  const [requested, setRequested] = useState(Boolean(initiallyRequested));
  const [following, setFollowing] = useState(Boolean(initiallyFollowing));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // keep local state in sync if props change externally
  useEffect(
    () => setRequested(Boolean(initiallyRequested)),
    [initiallyRequested]
  );
  useEffect(
    () => setFollowing(Boolean(initiallyFollowing)),
    [initiallyFollowing]
  );

  // send follow request
  const handleFollow = async () => {
    setLoading(true);
    setError('');
    try {
      await api.request(`/follows/requests/${id}`, { method: 'POST', token });
      setRequested(true);
      if (onRequested) onRequested();
      // notify other parts
      window.dispatchEvent(
        new CustomEvent('follows:updated', {
          detail: { action: 'requested', toUserId: id },
        })
      );
    } catch (err) {
      console.error('follow request error', err);
      setError(err?.body?.error || err?.message || 'Could not send request');
    } finally {
      setLoading(false);
    }
  };

  // cancel follow request
  const handleCancelRequest = async () => {
    setLoading(true);
    setError('');
    try {
      await api.request(`/follows/requests/${id}`, { method: 'DELETE', token });
      setRequested(false);
      if (onCancelled) onCancelled();
      window.dispatchEvent(
        new CustomEvent('follows:updated', {
          detail: { action: 'cancelled', toUserId: id },
        })
      );
    } catch (err) {
      console.error('cancel request error', err);
      setError(err?.body?.error || err?.message || 'Could not cancel request');
    } finally {
      setLoading(false);
    }
  };

  // unfollow (confirm)
  const handleUnfollow = async () => {
    const ok = window.confirm(`Are you sure you want to unfollow ${username}?`);
    if (!ok) return;

    setLoading(true);
    setError('');
    try {
      await api.request(`/follows/${id}`, { method: 'DELETE', token });
      setFollowing(false);
      if (onUnfollowed) onUnfollowed();
      window.dispatchEvent(
        new CustomEvent('follows:updated', {
          detail: { action: 'unfollowed', targetId: id },
        })
      );
    } catch (err) {
      console.error('unfollow error', err);
      setError(err?.body?.error || err?.message || 'Could not unfollow');
    } finally {
      setLoading(false);
    }
  };

  // when the other user accepts the request, server side will create a follow record.
  // We assume the global follows:updated event will be fired by notification handling;
  // but also expose a helper so parent can call onFollowed() to mark followed state.
  useEffect(() => {
    const handler = (ev) => {
      // if event mentions this user became followed (accepted)
      const d = ev?.detail || {};
      if (d.action === 'accepted') {
        // when accepted maybe detail contains requestId but not user ids. Best-effort:
        // reload state by asking parent (which will call onFollowed via fetch),
        // here we optimistically set following true if this user was the target of request
        // (we don't know who accepted), so ignore unless parent updates props.
      }
    };
    window.addEventListener('follows:updated', handler);
    return () => window.removeEventListener('follows:updated', handler);
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <img
          src={profilePic ? makeImageUrl(profilePic) : '/default-avatar.png'}
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
          {!token ? (
            <Link to="/auth/login" className={styles.followBtn}>
              Follow
            </Link>
          ) : loading ? (
            <button className={styles.followBtn} disabled>
              Processing…
            </button>
          ) : following ? (
            <button className={styles.followingBtn} onClick={handleUnfollow}>
              Following
            </button>
          ) : requested ? (
            <div className={styles.requestedWrap}>
              <button className={styles.requestedBtn} disabled>
                Requested
              </button>
              <button
                className={styles.cancelBtn}
                onClick={handleCancelRequest}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button className={styles.followBtn} onClick={handleFollow}>
              Follow
            </button>
          )}
        </div>
      </div>

      <p className={styles.bio}>{bio || 'No bio yet.'}</p>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
