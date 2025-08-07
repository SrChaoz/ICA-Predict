import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from './LoginForm';

const ProtectedRoute = ({ 
  children, 
  roles = [], 
  fallback = null 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Si se especifican roles, verificar que el usuario tenga uno de ellos
  if (roles.length > 0 && (!user || !roles.includes(user.rol))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-red-600">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-sm text-red-500 mt-2">
            Rol requerido: {roles.join(' o ')}
          </p>
          {user && (
            <p className="text-sm text-red-500">
              Tu rol actual: {user.rol}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Si no se especifica fallback y el usuario no tiene el rol, mostrar mensaje
  if (fallback && roles.length > 0 && (!user || !roles.includes(user.rol))) {
    return fallback;
  }

  // Usuario autenticado y con permisos
  return children;
};

export default ProtectedRoute;
