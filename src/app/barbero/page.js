'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import NotificationContainer from '@/components/NotificationContainer';
import { useNotification } from '@/hooks/useNotification';

export default function BarberoPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [socket, setSocket] = useState(null);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, appointmentId: null });
  const [cancelReason, setCancelReason] = useState('');
  const { notifications, removeNotification, success, error } = useNotification();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('newAppointment', (appointment) => {
      setAppointments(prev => [appointment, ...prev]);
      if (Notification.permission === 'granted') {
        new Notification('Nueva solicitud de turno', {
          body: `${appointment.clientName} solicita ${appointment.service}`,
          icon: '/favicon.ico'
        });
      }
    });

    fetchAppointments();

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => newSocket.close();
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

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
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
        
        if (socket) {
          socket.emit('appointmentUpdated', updatedAppointment);
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleCancel = (appointmentId) => {
    setCancelModal({ isOpen: true, appointmentId });
    setCancelReason('');
  };

  const confirmCancel = () => {
    updateAppointmentStatus(cancelModal.appointmentId, 'cancelled_by_barber', cancelReason);
    setCancelModal({ isOpen: false, appointmentId: null });
    setCancelReason('');
    success('Appointment cancelled successfully');
  };

  const handleComplete = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'completed');
    success('Appointment completed successfully');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'barber') {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-3xl mb-2 tracking-tight">BARBER PANEL</h1>
            <p className="text-gray-400 text-sm">
              Welcome, <span className="text-white">{user.name || user.email}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="bg-white text-black hover:bg-gray-200 px-6 py-2 text-sm uppercase tracking-wide transition-colors"
            >
              Sign Out
            </button>
            <Link 
              href="/" 
              className="border border-gray-600 hover:border-gray-400 text-white px-6 py-2 text-sm uppercase tracking-wide transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-900 border border-gray-800 p-6">
            <div className="text-2xl font-bold mb-1">{todayAppointments.length}</div>
            <div className="text-sm uppercase tracking-wide text-gray-400">Today</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6">
            <div className="text-2xl font-bold mb-1">{upcomingAppointments.length}</div>
            <div className="text-sm uppercase tracking-wide text-gray-400">Upcoming</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6">
            <div className="text-2xl font-bold mb-1">{completedAppointments.length}</div>
            <div className="text-sm uppercase tracking-wide text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6">
            <div className="text-2xl font-bold mb-1">{cancelledAppointments.length}</div>
            <div className="text-sm uppercase tracking-wide text-gray-400">Cancelled</div>
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <h2 className="text-lg uppercase tracking-wide">Today's Appointments</h2>
              <span className="text-gray-500 text-sm">{todayAppointments.length}</span>
            </div>

            <div className="space-y-4">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📅</div>
                  <p>No appointments scheduled for today</p>
                </div>
              ) : (
                todayAppointments
                  .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                  .map((appointment) => (
                  <div key={appointment.id} className="border border-gray-800 p-4 hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
                          {appointment.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{appointment.clientName}</div>
                          <div className="text-sm text-gray-400">📞 {appointment.clientPhone}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {new Date(appointment.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-xs text-gray-400">{appointment.duration} min</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="inline-block bg-gray-800 px-3 py-1 text-sm">
                        ✂️ {appointment.service.toUpperCase()}
                      </span>
                    </div>
                    
                    {appointment.notes && (
                      <div className="text-sm text-gray-400 mb-3 p-2 bg-gray-900">
                        {appointment.notes}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(appointment.id)}
                        className="flex-1 bg-white text-black hover:bg-gray-200 py-2 text-sm uppercase tracking-wide transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="flex-1 border border-white text-white hover:bg-white hover:text-black py-2 text-sm uppercase tracking-wide transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <h2 className="text-lg uppercase tracking-wide">Upcoming Appointments</h2>
              <span className="text-gray-500 text-sm">{upcomingAppointments.length}</span>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">⏰</div>
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                upcomingAppointments
                  .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                  .map((appointment) => (
                  <div key={appointment.id} className="border border-gray-800 p-4 hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
                          {appointment.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{appointment.clientName}</div>
                          <div className="text-sm text-gray-400">📞 {appointment.clientPhone}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          📅 {new Date(appointment.scheduledAt).toLocaleDateString()}
                        </div>
                        <div className="text-lg font-bold">
                          🕐 {new Date(appointment.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-xs text-gray-400">{appointment.duration} min</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="inline-block bg-gray-800 px-3 py-1 text-sm">
                        ✂️ {appointment.service.toUpperCase()}
                      </span>
                    </div>
                    
                    {appointment.notes && (
                      <div className="text-sm text-gray-400 mb-3 p-2 bg-gray-900">
                        {appointment.notes}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="w-full border border-white text-white hover:bg-white hover:text-black py-2 text-sm uppercase tracking-wide transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, appointmentId: null })}
        onConfirm={confirmCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? The client will be notified."
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        confirmStyle="danger"
      >
        <div className="space-y-3">
          <label className="block text-sm text-gray-400">
            Cancellation reason (optional):
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white p-3 text-sm focus:border-white focus:outline-none resize-none"
            rows={3}
            placeholder="Enter reason for cancellation..."
          />
        </div>
      </ConfirmModal>

      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </div>
  );
}