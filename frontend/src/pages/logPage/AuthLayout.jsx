// src/pages/account/AuthLayout.jsx
import { Outlet } from 'react-router-dom';
import authStyle from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={authStyle.container}>
      <div className={authStyle.background}></div>
      <div className={authStyle.card}>
        <Outlet />
      </div>
    </div>
  );
}
