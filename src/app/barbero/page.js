'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

export default function BarberoPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');

  // Verificar autenticación
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        const userData = await response.json();
        if (userData.role === 'barber') {
          setUser(userData);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    // Conectar a Socket.IO
    const newSocket = io();
    setSocket(newSocket);

    // Escuchar nuevas citas
    newSocket.on('newAppointment', (appointment) => {
      setAppointments(prev => [appointment, ...prev]);
      // Mostrar notificación
      if (Notification.permission === 'granted') {
        new Notification('Nueva solicitud de turno', {
          body: `${appointment.clientName} solicita ${appointment.service}`,
          icon: '/favicon.ico'
        });
      }
    });

    // Cargar citas existentes
    fetchAppointments();

    // Solicitar permisos de notificación
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => newSocket.close();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status, reason = null) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, cancellationReason: reason }),
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId ? updatedAppointment : apt
          )
        );
        
        // Emitir actualización via socket
        if (socket) {
          socket.emit('appointmentUpdated', updatedAppointment);
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleCancel = (appointmentId) => {
    const reason = prompt('Razón de la cancelación (opcional):');
    if (confirm('¿Estás seguro de cancelar esta cita? El cliente será notificado.')) {
      updateAppointmentStatus(appointmentId, 'cancelled_by_barber', reason);
    }
  };

  const handleComplete = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'completed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduledAt);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString() && apt.status === 'confirmed';
  });
  
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduledAt);
    const today = new Date();
    return aptDate > today && apt.status === 'confirmed';
  });
  
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = appointments.filter(apt => 
    apt.status === 'cancelled_by_barber' || apt.status === 'cancelled_by_client'
  );

  // Mostrar loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario o no es barbero, no mostrar nada (se redirige)
  if (!user || user.role !== 'barber') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel Barbero</h1>
            {user && (
              <p className="text-gray-600">Bienvenido, {user.name || user.email}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
            <Link 
              href="/" 
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver
            </Link>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Hoy</h3>
            <p className="text-2xl font-bold text-blue-900">{todayAppointments.length}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Próximas</h3>
            <p className="text-2xl font-bold text-green-900">{upcomingAppointments.length}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Completadas</h3>
            <p className="text-2xl font-bold text-purple-900">{completedAppointments.length}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Canceladas</h3>
            <p className="text-2xl font-bold text-red-900">{cancelledAppointments.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Citas de Hoy */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              Citas de Hoy ({todayAppointments.length})
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay citas para hoy
                </p>
              ) : (
                todayAppointments
                  .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                  .map((appointment) => (
                  <div key={appointment.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{appointment.clientName}</h3>
                      <span className="text-sm font-bold text-blue-600">
                        {new Date(appointment.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Servicio:</strong> {appointment.service} ({appointment.duration} min)
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Teléfono:</strong> {appointment.clientPhone}
                    </p>
                    
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Notas:</strong> {appointment.notes}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(appointment.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm transition-colors"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Próximas Citas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Próximas Citas ({upcomingAppointments.length})
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay citas próximas
                </p>
              ) : (
                upcomingAppointments
                  .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                  .map((appointment) => (
                  <div key={appointment.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{appointment.clientName}</h3>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">
                          {new Date(appointment.scheduledAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-green-600">
                          {new Date(appointment.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Servicio:</strong> {appointment.service} ({appointment.duration} min)
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Teléfono:</strong> {appointment.clientPhone}
                    </p>
                    
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Notas:</strong> {appointment.notes}
                      </p>
                    )}
                    
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      Cancelar Cita
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}