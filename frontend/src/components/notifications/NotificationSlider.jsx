import { useNotificationUI } from './NotificationProvider';
import styles from './NotificationSlider.module.css';
import { Link } from 'react-router-dom';

const Icon = ({ type }) => {
  if (type === 'like') return <span className={styles.iconLike}>❤</span>;
  if (type === 'comment') return <span className={styles.iconComment}>💬</span>;
  if (type === 'follow_request')
    return <span className={styles.iconFollow}>➕</span>;
  if (type === 'follow_accepted')
    return <span className={styles.iconAccept}>✔</span>;
  return <span className={styles.iconDefault}>🔔</span>;
};

const NotificationItem = ({ n, onAccept, onReject, onMarkRead, onDelete }) => {
  const text = (() => {
    if (n.type === 'follow_request') {
      const username = n.data?.fromUsername || n.data?.fromName || 'Someone';
      return `${username} sent you a follow request.`;
    }
    if (n.type === 'follow_accepted') {
      return `Your follow request was accepted.`;
    }
    return n.data?.text || `Notification: ${n.type}`;
  })();

  return (
    <div className={styles.item} data-read={n.read}>
      <div className={styles.itemLeft}>
        <div className={styles.avatarMock} aria-hidden>
          {(n.data?.fromName || n.data?.fromUsername || 'U')[0]}
        </div>
        <div>
          <div className={styles.itemText}>{text}</div>
          <div className={styles.itemTime}>
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className={styles.itemRight}>
        <Icon type={n.type} />
        {/* actions for follow_request */}
        {n.type === 'follow_request' && (
          <>
            <div style={{ height: 8 }} />
            <button
              className={styles.markAllBtn}
              onClick={() => onAccept(n)}
              title="Accept"
              style={{ display: 'block', marginTop: 8 }}
            >
              Accept
            </button>
            <button
              className={styles.closeBtn}
              onClick={() => onReject(n)}
              title="Reject"
              style={{ display: 'block', marginTop: 6 }}
            >
              Reject
            </button>
          </>
        )}
        <div style={{ height: 6 }} />
        <button
          className={styles.closeBtn}
          onClick={() => onMarkRead(n)}
          title="Mark read"
        >
          ✓
        </button>
        <button
          className={styles.closeBtn}
          onClick={() => onDelete(n)}
          title="Delete"
        >
          🗑
        </button>
      </div>
    </div>
  );
};

const NotificationSlider = () => {
  const {
    open,
    closePanel,
    notifications,
    loading,
    respondToFollowRequest,
    markAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotificationUI();

  const handleAccept = async (n) => {
    await respondToFollowRequest({
      requestId: n.data?.requestId,
      notificationId: n.id,
      action: 'accept',
    });
    await fetchNotifications();
    window.dispatchEvent(
      new CustomEvent('follows:updated', {
        detail: { action: 'accepted', requestId: n.data?.requestId },
      })
    );
  };

  const handleReject = async (n) => {
    await respondToFollowRequest({
      requestId: n.data?.requestId,
      notificationId: n.id,
      action: 'reject',
    });
    await fetchNotifications();
    window.dispatchEvent(
      new CustomEvent('follows:updated', {
        detail: { action: 'rejected', requestId: n.data?.requestId },
      })
    );
  };

  const handleMarkRead = async (n) => {
    await markAsRead(n.id);
    await fetchNotifications();
  };

  const handleDelete = async (n) => {
    await deleteNotification(n.id);
    await fetchNotifications();
  };

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
            <button className={styles.markAllBtn} onClick={() => {}}>
              Mark all read
            </button>
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
            {loading ? (
              <div style={{ padding: 12 }}>Loading…</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 12, color: '#7b7a64' }}>
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  onAccept={(notif) => handleAccept(notif)}
                  onReject={(notif) => handleReject(notif)}
                  onMarkRead={(notif) => handleMarkRead(notif)}
                  onDelete={(notif) => handleDelete(notif)}
                />
              ))
            )}
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
