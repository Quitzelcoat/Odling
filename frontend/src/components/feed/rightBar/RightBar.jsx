// src/components/feed/rightBar/RightBar.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../auth/api';
import { useAuth } from '../../../auth/context';
import styles from './RightBar.module.css';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const RightBar = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [recs, setRecs] = useState([]); // recommended users
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [requestedIds, setRequestedIds] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    setErr('');
    setLoading(true);
    try {
      // load all users (server returns users array)
      const usersRes = await api.request('/users');
      const allUsers = Array.isArray(usersRes.users) ? usersRes.users : [];

      // filter out self
      const possible = allUsers.filter((u) => u.id !== user?.id);

      // fetch following list for "me" (to exclude people we already follow)
      let followingSet = new Set();
      if (token && user?.id) {
        try {
          const fRes = await api.request(`/follows/following/${user.id}`);
          const fUsers = Array.isArray(fRes.users) ? fRes.users : [];
          followingSet = new Set(fUsers.map((u) => u.id));
          setFollowingIds(followingSet);
        } catch (err) {
          // ignore if not authenticated or API error — we'll still show recs
          console.error('fetch following (rightbar) error', err);
        }
      }

      // fetch outgoing requests to mark requested
      let requestedSet = new Set();
      if (token) {
        try {
          const out = await api.request('/follows/requests/outgoing', {
            token,
          });
          const outReq = Array.isArray(out.requests) ? out.requests : [];
          requestedSet = new Set(
            outReq
              .map((r) => (r.to ? r.to.id : r.toUserId || null))
              .filter(Boolean)
          );
          setRequestedIds(requestedSet);
        } catch (err) {
          console.error('fetch outgoing (rightbar) error', err);
        }
      }

      // pick candidates: prefer those not already followed; if not enough, include others
      let candidates = possible.filter((u) => !followingSet.has(u.id));
      if (candidates.length < 3) {
        // include some who we already follow only if not enough people exist
        candidates = possible;
      }

      // randomize & slice up to 3
      const selected = shuffle(candidates).slice(0, 3);
      setRecs(selected);
    } catch (err) {
      console.error('load recs error', err);
      setErr(
        err?.body?.error || err?.message || 'Could not load recommendations'
      );
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchRecommendations();
    const handler = () => fetchRecommendations();
    window.addEventListener('follows:updated', handler);
    return () => window.removeEventListener('follows:updated', handler);
  }, [fetchRecommendations]);

  // follow -> send follow request
  const handleFollow = async (toId) => {
    if (!token) {
      // send to login
      navigate('/auth/login');
      return;
    }

    setActionLoadingId(toId);
    try {
      await api.request(`/follows/requests/${toId}`, { method: 'POST', token });
      setRequestedIds((prev) => new Set(prev).add(toId));
      // notify other components to refresh
      window.dispatchEvent(
        new CustomEvent('follows:updated', {
          detail: { action: 'requested', toUserId: toId },
        })
      );
    } catch (err) {
      console.error('follow request error', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // cancel outgoing request
  const handleCancelRequest = async (toId) => {
    setActionLoadingId(toId);
    try {
      await api.request(`/follows/requests/${toId}`, {
        method: 'DELETE',
        token,
      });
      setRequestedIds((prev) => {
        const copy = new Set(prev);
        copy.delete(toId);
        return copy;
      });
      window.dispatchEvent(
        new CustomEvent('follows:updated', {
          detail: { action: 'cancelled', toUserId: toId },
        })
      );
    } catch (err) {
      console.error('cancel request error', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // unfollow (confirm)
  const handleUnfollow = async (followedId) => {
    const ok = window.confirm('Are you sure you want to unfollow this user?');
    if (!ok) return;
    setActionLoadingId(followedId);
    try {
      await api.request(`/follows/${followedId}`, { method: 'DELETE', token });
      setFollowingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(followedId);
        return copy;
      });
      window.dispatchEvent(
        new CustomEvent('follows:updated', {
          detail: { action: 'unfollowed', targetId: followedId },
        })
      );
    } catch (err) {
      console.error('unfollow error', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // helper to get state
  const isRequested = (id) => requestedIds.has(id);
  const isFollowing = (id) => followingIds.has(id);

  return (
    <aside className={styles.completeBar}>
      <div className={styles.userInfo}>
        <Link to="/profile" className={styles.userLink}>
          <img
            src={user?.profilePic || '/default-avatar.png'}
            alt={user?.username || 'You'}
            className={styles.avatar}
          />
          <span className={styles.username}>
            {user?.username || user?.name || `User ${user?.id}`}
          </span>
        </Link>
      </div>

      <div className={styles.recommended}>
        <h3 className={styles.title}>Recommended</h3>

        {loading ? (
          <div className={styles.center}>Loading…</div>
        ) : err ? (
          <div className={styles.centerError}>{err}</div>
        ) : recs.length === 0 ? (
          <div className={styles.center}>No recommendations right now.</div>
        ) : (
          <ul className={styles.list}>
            {recs.map((u) => (
              <li key={u.id} className={styles.item}>
                <Link to={`/profile/${u.id}`} className={styles.left}>
                  <img
                    src={u.profilePic || '/default-avatar.png'}
                    alt={u.username}
                    className={styles.itemAvatar}
                  />
                  <div className={styles.meta}>
                    <div className={styles.uname}>{u.username}</div>
                    <div className={styles.small}>{u.name || '—'}</div>
                  </div>
                </Link>

                <div className={styles.actions}>
                  {!token ? (
                    <Link to="/auth/login" className={styles.followBtn}>
                      Follow
                    </Link>
                  ) : isFollowing(u.id) ? (
                    <button
                      className={styles.followingBtn}
                      onClick={() => handleUnfollow(u.id)}
                      disabled={actionLoadingId === u.id}
                      title="Click to unfollow"
                    >
                      {actionLoadingId === u.id ? '…' : 'Following'}
                    </button>
                  ) : isRequested(u.id) ? (
                    <div className={styles.requestWrap}>
                      <button className={styles.requestedBtn} disabled>
                        Requested
                      </button>
                      <button
                        className={styles.cancelSmall}
                        onClick={() => handleCancelRequest(u.id)}
                        disabled={actionLoadingId === u.id}
                        aria-label="Cancel request"
                        title="Cancel request"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.followBtn}
                      onClick={() => handleFollow(u.id)}
                      disabled={actionLoadingId === u.id}
                    >
                      {actionLoadingId === u.id ? '…' : 'Follow'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.footerNote}>
        <small>
          Suggestions refresh on page load or when follow activity happens.
        </small>
      </div>
    </aside>
  );
};

export default RightBar;
