'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import NotificationContainer from '@/components/NotificationContainer';
import InfoModal from '@/components/InfoModal';
import { useNotification } from '@/hooks/useNotification';

export default function ClientePage() {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    service: 'corte',
    date: '',
    time: '',
    notes: ''
  });
  const [appointments, setAppointments] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [searchData, setSearchData] = useState({
    name: '',
    phone: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [infoModal, setInfoModal] = useState({ isOpen: false, title: '', message: '' });
  const { notifications, removeNotification, success, error } = useNotification();

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('appointmentUpdate', (updatedAppointment) => {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === updatedAppointment.id ? updatedAppointment : apt
        )
      );
      
      if (updatedAppointment.status === 'cancelled_by_barber') {
        const appointmentDate = new Date(updatedAppointment.scheduledAt).toLocaleString();
        const reason = updatedAppointment.cancellationReason 
          ? `\nReason: ${updatedAppointment.cancellationReason}` 
          : '';
        
        setInfoModal({
          isOpen: true,
          title: 'Appointment Cancelled',
          message: `Your appointment on ${appointmentDate} has been cancelled by the barber.${reason}\n\nYou can book a new appointment!`
        });
      }
    });

    return () => newSocket.close();
  }, []);

  const loadAvailableSlots = async (date, service) => {
    if (!date || !service) return;
    
    setIsLoadingSlots(true);
    try {
      const response = await fetch(`/api/availability?date=${date}&service=${service}`);
      const data = await response.json();
      
      if (response.ok) {
        setAvailableSlots(data.availableSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setFormData({...formData, date, time: ''});
    loadAvailableSlots(date, formData.service);
  };

  const handleServiceChange = (service) => {
    setFormData({...formData, service, time: ''});
    if (formData.date) {
      loadAvailableSlots(formData.date, service);
    }
  };

  const searchMyAppointments = async () => {
    if (!searchData.name || !searchData.phone) {
      error('Please enter your name and phone number');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/appointments/search?name=${encodeURIComponent(searchData.name)}&phone=${encodeURIComponent(searchData.phone)}`);
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data);
        setShowMyAppointments(true);
      } else {
        error(data.error || 'Error searching appointments');
      }
    } catch (err) {
      error('Error searching appointments');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      error('Please select date and time');
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}:00`);
      
      const requestData = {
        ...formData,
        scheduledAt: scheduledAt.toISOString()
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const newAppointment = await response.json();
        
        if (showMyAppointments && 
            formData.clientName.toLowerCase() === searchData.name.toLowerCase() &&
            formData.clientPhone === searchData.phone) {
          setAppointments(prev => [newAppointment, ...prev]);
        }
        
        if (socket) {
          socket.emit('newAppointment', newAppointment);
        }
        
        setFormData({
          clientName: '',
          clientPhone: '',
          service: 'corte',
          date: '',
          time: '',
          notes: ''
        });
        setAvailableSlots([]);
        success('Appointment confirmed successfully! ✓');
      }
    } catch (err) {
      error('Error booking appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-white';
      case 'cancelled_by_barber': return 'text-gray-500';
      case 'cancelled_by_client': return 'text-gray-500';
      case 'completed': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'CONFIRMED';
      case 'cancelled_by_barber': return 'CANCELLED';
      case 'cancelled_by_client': return 'CANCELLED';
      case 'completed': return 'COMPLETED';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link 
            href="/" 
            className="text-white hover:text-gray-300 transition-colors"
          >
            ←
          </Link>
          <h1 className="font-display text-2xl tracking-tight">BARBER</h1>
          <div className="w-6"></div>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-gray-800 mb-8">
          <button
            onClick={() => setShowMyAppointments(false)}
            className={`flex-1 py-4 text-sm uppercase tracking-wide transition-colors ${
              !showMyAppointments 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Book
          </button>
          <button
            onClick={() => setShowMyAppointments(true)}
            className={`flex-1 py-4 text-sm uppercase tracking-wide transition-colors ${
              showMyAppointments 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            My Appointments
          </button>
        </div>

        {!showMyAppointments ? (
          /* Booking Form */
          <div className="space-y-8">
            {/* Services */}
            <div>
              <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-4">Service</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'corte', name: 'Hair Cut', duration: '30min' },
                  { id: 'barba', name: 'Beard', duration: '20min' },
                  { id: 'corte-barba', name: 'Hair + Beard', duration: '45min' },
                  { id: 'afeitado', name: 'Shave', duration: '25min' }
                ].map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceChange(service.id)}
                    className={`p-4 border text-left transition-colors ${
                      formData.service === service.id
                        ? 'bg-white text-black border-white'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs text-gray-500">{service.duration}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm uppercase tracking-wide text-gray-400 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-800 py-3 focus:outline-none focus:border-white transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wide text-gray-400 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-800 py-3 focus:outline-none focus:border-white transition-colors"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wide text-gray-400 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full bg-transparent border-b border-gray-800 py-3 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {formData.date && (
                <div>
                  <label className="block text-sm uppercase tracking-wide text-gray-400 mb-4">
                    Time
                  </label>
                  {isLoadingSlots ? (
                    <div className="text-center py-8">
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormData({...formData, time: slot})}
                          className={`py-3 text-sm border transition-colors ${
                            formData.time === slot
                              ? 'bg-white text-black border-white'
                              : 'border-gray-800 hover:border-gray-600'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No available times</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm uppercase tracking-wide text-gray-400 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-800 py-3 focus:outline-none focus:border-white transition-colors resize-none"
                  rows="2"
                  placeholder="Special requests..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.date || !formData.time}
                className="w-full bg-white text-black py-4 font-medium uppercase tracking-wide hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        ) : (
          /* My Appointments */
          <div className="space-y-8">
            <div>
              <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-4">Find Your Appointments</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={searchData.name}
                  onChange={(e) => setSearchData({...searchData, name: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-800 py-3 focus:outline-none focus:border-white transition-colors"
                  placeholder="Your name"
                />
                <input
                  type="tel"
                  value={searchData.phone}
                  onChange={(e) => setSearchData({...searchData, phone: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-800 py-3 focus:outline-none focus:border-white transition-colors"
                  placeholder="Your phone"
                />
                <button
                  onClick={searchMyAppointments}
                  disabled={isSearching}
                  className="w-full bg-white text-black py-4 font-medium uppercase tracking-wide hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {appointments.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-wide text-gray-400 mb-4">Your Appointments</h3>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-800 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{appointment.service.toUpperCase()}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(appointment.scheduledAt).toLocaleDateString()} at {new Date(appointment.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <div className={`text-xs uppercase tracking-wide ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="text-sm text-gray-500 mt-2">{appointment.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ isOpen: false, title: '', message: '' })}
        title={infoModal.title}
        message={infoModal.message}
      />

      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </div>
  );
}