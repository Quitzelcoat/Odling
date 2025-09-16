// src/pages/profile/FollowersModal.jsx
import React from 'react';
import styles from './FollowersModal.module.css';
import { Link } from 'react-router-dom';

export default function FollowersModal({
  type,
  onClose,
  followers = [],
  following = [],
  onUnfollow,
}) {
  const list = type === 'followers' ? followers : following;
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={type === 'followers' ? 'Followers' : 'Following'}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>
              {type === 'followers' ? 'Followers' : 'Following'}{' '}
              <span className={styles.count}>({list.length})</span>
            </h3>
            <p className={styles.subtitle}>
              {type === 'followers'
                ? 'People who follow you'
                : 'People you follow'}
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.inner}>
          {list.length === 0 ? (
            <div className={styles.empty}>No users to show.</div>
          ) : (
            <div className={styles.list}>
              {list.map((u) => (
                <div key={u.id} className={styles.row}>
                  <div className={styles.left}>
                    <img
                      src={u.profilePic || '/default-avatar.png'}
                      alt={u.username}
                      className={styles.avatar}
                      width="56"
                      height="56"
                    />
                    <div className={styles.info}>
                      <Link
                        to={`/profile/${u.id}`}
                        className={styles.username}
                        onClick={onClose}
                      >
                        {u.username}
                      </Link>
                      <div className={styles.name}>{u.name || ''}</div>
                    </div>
                  </div>

                  <div className={styles.right}>
                    {type === 'following' ? (
                      <button
                        className={styles.unfollowBtn}
                        onClick={() => {
                          if (typeof onUnfollow === 'function')
                            onUnfollow(u.id);
                        }}
                      >
                        Unfollow
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.closeAction} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
