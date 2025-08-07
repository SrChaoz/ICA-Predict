import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Trash2, 
  Lock,
  Unlock,
  Shield,
  LogOut,
  Home,
  Database,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  
  // Formulario para nuevo usuario
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    nombre: '',
    email: '',
    rol: 'operador'
  });
  const [showPassword, setShowPassword] = useState(false);

  // Hooks siempre se ejecutan antes de cualquier return condicional
  useEffect(() => {
    if (user?.rol === 'admin') {
      fetchUsers();
    }
  }, [user]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Solo usuarios con rol 'admin' pueden acceder
  if (user?.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Acceso Restringido
            </h3>
            <p className="text-red-600 mb-4">
              Solo los administradores pueden acceder a este panel.
            </p>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authService.getUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones mejoradas
    if (!newUser.username || !newUser.password || !newUser.nombre || !newUser.email) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (newUser.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    if (newUser.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      await authService.createUser(newUser);
      setSuccess(`Usuario ${newUser.username} creado exitosamente con rol ${newUser.rol}`);
      setNewUser({ username: '', password: '', nombre: '', email: '', rol: 'operador' });
      fetchUsers();
      setActiveTab('users'); // Cambiar a la pestaña de usuarios
    } catch (err) {
      setError(err.message || 'Error al crear usuario');
    }
  };

  const toggleUserStatus = async (userId, currentStatus, username) => {
    try {
      await authService.toggleUserStatus(userId, !currentStatus);
      setSuccess(`Usuario ${username} ${currentStatus ? 'desactivado' : 'activado'} exitosamente`);
      fetchUsers();
    } catch (err) {
      setError('Error al cambiar estado del usuario');
      console.error('Error toggling user status:', err);
    }
  };

  const handleInputChange = (e) => {
    setNewUser(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'operador': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'control_calidad': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const goToMainApp = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header mejorado */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600/10 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-600">
                  Gestión completa del sistema ICA-Predict
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                {user?.nombre} (Admin)
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={goToMainApp}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Ir al Sistema</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Alertas globales */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestión de Usuarios
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Crear Usuario
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Estado del Sistema
            </TabsTrigger>
          </TabsList>

          {/* Gestión de Usuarios */}
          <TabsContent value="users">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuarios del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Cargando usuarios...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No hay usuarios registrados</p>
                    ) : (
                      <div className="grid gap-4">
                        {users.map((userItem) => (
                          <div 
                            key={userItem.id} 
                            className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="font-medium text-gray-900">
                                  {userItem.nombre}
                                </div>
                                <Badge variant="outline" className={getRoleBadgeColor(userItem.rol)}>
                                  {userItem.rol}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={userItem.activo 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-red-100 text-red-800 border-red-200'
                                  }
                                >
                                  {userItem.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Usuario:</span> {userItem.username} | 
                                <span className="font-medium"> Email:</span> {userItem.email || 'No especificado'} |
                                <span className="font-medium"> Creado:</span> {new Date(userItem.fecha_creacion).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleUserStatus(userItem.id, userItem.activo, userItem.username)}
                                className={userItem.activo 
                                  ? 'hover:bg-red-50 hover:border-red-200 hover:text-red-700' 
                                  : 'hover:bg-green-50 hover:border-green-200 hover:text-green-700'
                                }
                                disabled={userItem.id === user?.id} // No puede desactivarse a sí mismo
                              >
                                {userItem.activo ? (
                                  <>
                                    <Lock className="h-4 w-4 mr-1" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="h-4 w-4 mr-1" />
                                    Activar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crear Usuario */}
          <TabsContent value="create">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Crear Nuevo Usuario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nombre de Usuario *
                      </label>
                      <Input
                        type="text"
                        name="username"
                        value={newUser.username}
                        onChange={handleInputChange}
                        placeholder="ej: usuario123"
                        className="w-full"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nombre Completo *
                      </label>
                      <Input
                        type="text"
                        name="nombre"
                        value={newUser.nombre}
                        onChange={handleInputChange}
                        placeholder="ej: Juan Pérez"
                        className="w-full"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        placeholder="ej: usuario@empresa.com"
                        className="w-full"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Rol *
                      </label>
                      <select
                        name="rol"
                        value={newUser.rol}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        required
                      >
                        <option value="operador">Operador</option>
                        <option value="control_calidad">Control de Calidad</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={newUser.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewUser({ username: '', password: '', nombre: '', email: '', rol: 'operador' })}
                    >
                      Limpiar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Crear Usuario
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estado del Sistema */}
          <TabsContent value="system">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-900">
                          {users.length}
                        </div>
                        <div className="text-sm text-blue-700">
                          Usuarios Totales
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-900">
                          {users.filter(u => u.activo).length}
                        </div>
                        <div className="text-sm text-green-700">
                          Usuarios Activos
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <div className="text-2xl font-bold text-red-900">
                          {users.filter(u => !u.activo).length}
                        </div>
                        <div className="text-sm text-red-700">
                          Usuarios Inactivos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Información del Sistema</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Versión:</strong> ICA-Predict v1.0</div>
                    <div><strong>Base de datos:</strong> Supabase</div>
                    <div><strong>Autenticación:</strong> JWT + bcrypt</div>
                    <div><strong>Administrador:</strong> {user?.nombre} ({user?.username})</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
