/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import api from '../../auth/api';
import { useAuth } from '../../auth/context';

const NotificationUIContext = createContext();

export const useNotificationUI = () => useContext(NotificationUIContext);

export default function NotificationProvider({ children }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const data = await api.request('/notifications', { token });
      const items = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(items);
      setUnreadCount(items.filter((n) => n.read === false).length);
    } catch (err) {
      console.error('fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    // optional: poll every 20s
    const id = setInterval(() => {
      fetchNotifications();
    }, 20000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const toggle = () => setOpen((v) => !v);
  const openPanel = () => setOpen(true);
  const closePanel = () => setOpen(false);

  const markAsRead = async (id) => {
    if (!token) return;
    try {
      await api.request(`/notifications/${id}/read`, { method: 'POST', token });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('markAsRead', err);
    }
  };

  const deleteNotification = async (id) => {
    if (!token) return;
    try {
      await api.request(`/notifications/${id}`, { method: 'DELETE', token });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('deleteNotification', err);
    }
  };

  // accept / reject follow request (by requestId and notification id)
  const respondToFollowRequest = async ({
    requestId,
    notificationId,
    action,
  }) => {
    if (!token) return { ok: false, error: 'Not authenticated' };
    try {
      await api.request(`/follows/requests/${requestId}/respond`, {
        method: 'POST',
        token,
        body: { action },
      });

      // remove the follow_request notification (handled), mark it read or delete it
      if (notificationId) {
        await deleteNotification(notificationId);
      } else {
        // fallback: refresh notifications
        await fetchNotifications();
      }

      // trigger a global event so other parts of UI can refresh
      window.dispatchEvent(
        new CustomEvent('follows:updated', { detail: { action, requestId } })
      );

      // if accepted, the server also created a 'follow_accepted' notification for the requester
      // refresh notifications to pick up any new ones
      await fetchNotifications();

      return { ok: true };
    } catch (err) {
      console.error('respondToFollowRequest', err);
      return { ok: false, error: err?.body?.error || err?.message || 'Failed' };
    }
  };

  const value = {
    open,
    toggle,
    openPanel,
    closePanel,
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    respondToFollowRequest,
  };

  return (
    <NotificationUIContext.Provider value={value}>
      {children}
    </NotificationUIContext.Provider>
  );
}
