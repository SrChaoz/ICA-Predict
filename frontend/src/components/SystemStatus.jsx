// =====================================================
// COMPONENTE PARA MOSTRAR ESTADO DEL SISTEMA
// =====================================================

import { useState, useEffect } from 'react';
import { fetchSystemInfo } from '../services/dataService';

const SystemStatus = () => {
    const [systemInfo, setSystemInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSystemInfo = async () => {
            try {
                const info = await fetchSystemInfo();
                setSystemInfo(info);
            } catch (error) {
                console.error('Error obteniendo info del sistema:', error);
            } finally {
                setLoading(false);
            }
        };

        getSystemInfo();
        
        // Actualizar cada 30 segundos
        const interval = setInterval(getSystemInfo, 30000);
        
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Verificando conexión...</span>
            </div>
        );
    }

    if (!systemInfo) {
        return (
            <div className="flex items-center space-x-2 text-sm text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Sin conexión</span>
            </div>
        );
    }

    const getDatabaseStatus = () => {
        const { database } = systemInfo;
        switch (database) {
            case 'supabase':
                return {
                    color: 'text-green-600',
                    bgColor: 'bg-green-500',
                    label: 'Supabase (Nube)',
                    icon: '☁️'
                };
            case 'local':
                return {
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-500',
                    label: 'PostgreSQL (Local)',
                    icon: '🗄️'
                };
            default:
                return {
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-500',
                    label: 'Desconocido',
                    icon: '❓'
                };
        }
    };

    const dbStatus = getDatabaseStatus();

    return (
        <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${dbStatus.bgColor} rounded-full animate-pulse`}></div>
                <span className={dbStatus.color}>
                    {dbStatus.icon} {dbStatus.label}
                </span>
            </div>
            
            <div className="text-gray-500">
                v{systemInfo.version || '1.0.0'}
            </div>
            
            <div className="text-xs text-gray-400">
                {new Date(systemInfo.timestamp).toLocaleTimeString()}
            </div>
        </div>
    );
};

export default SystemStatus;
