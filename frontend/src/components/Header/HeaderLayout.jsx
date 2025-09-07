// src/components/dashboard/DashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function HeaderLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
