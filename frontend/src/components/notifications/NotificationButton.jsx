// src/components/notifications/NotificationButton.jsx
import React from 'react';
import { useNotificationUI } from './NotificationProvider';
import styles from './NotificationSlider.module.css'; // re-use badge + bell styles

const NotificationButton = () => {
  const { toggle, unreadCount } = useNotificationUI();
  const unread = Number(unreadCount || 0);

  return (
    <button
      className={styles.bellBtn}
      onClick={toggle}
      aria-label="Notifications"
      title="Notifications"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M15 17H9a3 3 0 0 1-3-3V11c0-3-1-5-1-5a6 6 0 0 1 12 0s-1 2-1 5v3a3 3 0 0 1-3 3z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {unread > 0 && (
        <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
      )}
    </button>
  );
};

export default NotificationButton;
