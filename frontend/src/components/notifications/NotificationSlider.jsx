// src/components/notifications/NotificationSlider.jsx
import React from 'react';
import { useNotificationUI } from './NotificationProvider';
import styles from './NotificationSlider.module.css';
import { Link } from 'react-router-dom';

/**
 * Mock notifications for the UI-only version.
 * Later replace with fetch(`/notifications`) data.
 */
const mockNotifications = [
  { id: 1, type: 'like', text: 'Aisha liked your post.', time: '2m' },
  {
    id: 2,
    type: 'comment',
    text: 'Kamal commented: "Lovely thought!"',
    time: '18m',
  },
  {
    id: 3,
    type: 'follow_request',
    text: 'Hassan sent you a follow request.',
    time: '1h',
  },
  {
    id: 4,
    type: 'follow_accepted',
    text: 'Zara accepted your follow request.',
    time: 'Yesterday',
  },
];

const Icon = ({ type }) => {
  if (type === 'like') return <span className={styles.iconLike}>❤</span>;
  if (type === 'comment') return <span className={styles.iconComment}>💬</span>;
  if (type === 'follow_request')
    return <span className={styles.iconFollow}>➕</span>;
  if (type === 'follow_accepted')
    return <span className={styles.iconAccept}>✔</span>;
  return <span className={styles.iconDefault}>🔔</span>;
};

const NotificationItem = ({ n }) => (
  <div className={styles.item}>
    <div className={styles.itemLeft}>
      <div className={styles.avatarMock} aria-hidden>
        {n.text[0]}
      </div>
      <div>
        <div className={styles.itemText}>{n.text}</div>
        <div className={styles.itemTime}>{n.time}</div>
      </div>
    </div>
    <div className={styles.itemRight}>
      <Icon type={n.type} />
    </div>
  </div>
);

const NotificationSlider = () => {
  const { open, closePanel } = useNotificationUI();

  // keep mounted but hidden for accessibility / animation
  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        onClick={closePanel}
        aria-hidden={!open}
      />

      <aside
        className={`${styles.slider} ${open ? styles.open : ''}`}
        role="dialog"
        aria-label="Notifications"
        aria-hidden={!open}
      >
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Notifications</h3>
            <p className={styles.sub}>Likes, comments & follow activity</p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.markAllBtn}>Mark all read</button>
            <button
              className={styles.closeBtn}
              onClick={closePanel}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>New</div>
          <div className={styles.list}>
            {mockNotifications.map((n) => (
              <NotificationItem key={n.id} n={n} />
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <Link
            to="/notifications"
            className={styles.viewAllLink}
            onClick={closePanel}
          >
            View all notifications
          </Link>
        </div>
      </aside>
    </>
  );
};

export default NotificationSlider;
