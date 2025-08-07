import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configurar axios para incluir token automáticamente
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Login
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { user, token };
      } else {
        throw new Error(response.data.message || 'Error en login');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión');
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  // Verificar si está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtener usuario actual
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken() {
    return localStorage.getItem('token');
  },

  // Verificar token en el servidor
  async verifyToken() {
    try {
      const response = await api.get('/api/auth/verify');
      return response.data.success;
    } catch {
      return false;
    }
  },

  // Verificar rol
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    return user && user.rol === requiredRole;
  },

  // Verificar múltiples roles
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return user && roles.includes(user.rol);
  },

  // Crear nuevo usuario (solo para control de calidad)
  async createUser(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al crear usuario');
    }
  },

  // Obtener lista de usuarios (solo admin)
  async getUsers() {
    try {
      const response = await api.get('/api/auth/users');
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener usuarios');
    }
  },

  // Activar/Desactivar usuario (solo admin)
  async toggleUserStatus(userId, activo) {
    try {
      const response = await api.patch(`/api/auth/users/${userId}/toggle`, { activo });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al cambiar estado del usuario');
    }
  },

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.patch('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al cambiar contraseña');
    }
  }
};

export default authService;

// Exportar también la instancia de axios configurada
export { api };
