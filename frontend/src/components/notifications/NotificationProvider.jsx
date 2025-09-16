/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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

  // keep track of previously seen notification ids to detect new ones
  const prevIdsRef = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      prevIdsRef.current = new Set();
      return;
    }
    setLoading(true);
    try {
      const data = await api.request('/notifications', { token });
      const items = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(items);
      setUnreadCount(items.filter((n) => n.read === false).length);

      // detect newly arrived notifications
      const prevIds = prevIdsRef.current;
      const newItems = items.filter((n) => !prevIds.has(n.id));
      if (newItems.length > 0) {
        // check for follow_accepted notifications — trigger app-wide update
        const accepted = newItems.find((n) => n.type === 'follow_accepted');
        if (accepted) {
          // notify other UI to refresh follow lists immediately
          window.dispatchEvent(
            new CustomEvent('follows:updated', {
              detail: { action: 'follow_accepted', notification: accepted },
            })
          );
        }
      }

      // update prevIds
      prevIdsRef.current = new Set(items.map((n) => n.id));
    } catch (err) {
      console.error('fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
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

  // respond to follow request: accept | reject
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

      // delete the follow_request notification (recipient handled it)
      if (notificationId) await deleteNotification(notificationId);

      // dispatch global update (recipient browser)
      window.dispatchEvent(
        new CustomEvent('follows:updated', { detail: { action, requestId } })
      );

      // re-fetch notifications to pick up follow_accepted created for requester
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
