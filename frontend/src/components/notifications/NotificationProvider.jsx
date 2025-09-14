import React, { createContext, useContext, useState } from 'react';

const NotificationUIContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationUI = () => useContext(NotificationUIContext);

export default function NotificationProvider({ children }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const openPanel = () => setOpen(true);
  const closePanel = () => setOpen(false);

  return (
    <NotificationUIContext.Provider
      value={{ open, toggle, openPanel, closePanel }}
    >
      {children}
    </NotificationUIContext.Provider>
  );
}
