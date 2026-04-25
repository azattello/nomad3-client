import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Компонент для защиты клиентских маршрутов
 * Доступен только для обычных пользователей (не админов и не филиалов)
 * Админы перенаправляются на админку
 */
const ClientRoute = ({ children }) => {
  const isAuth = useSelector(state => state.user.isAuth);
  const role = useSelector(state => state.user.currentUser?.role);

  // Если не авторизован, редирект на логин
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Если админ или филиал, редирект на админку
  if (role === 'admin' || role === 'filial' || role === 'china') {
    return <Navigate to="/dashboard" replace />;
  }

  // Если обычный пользователь, показываем компонент
  return children;
};

export default ClientRoute;
