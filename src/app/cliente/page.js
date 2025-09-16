'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';

export default function ClientePage() {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    service: 'corte',
    date: '',
    time: '',
    notes: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para ver turnos existentes
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [searchData, setSearchData] = useState({
    name: '',
    phone: ''
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Conectar a Socket.IO
    const newSocket = io();
    setSocket(newSocket);

    // Escuchar actualizaciones de citas
    newSocket.on('appointmentUpdate', (updatedAppointment) => {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === updatedAppointment.id ? updatedAppointment : apt
        )
      );
      
      // Mostrar notificación si fue cancelada por el barbero
      if (updatedAppointment.status === 'cancelled_by_barber') {
        const appointmentDate = new Date(updatedAppointment.scheduledAt).toLocaleString();
        const reason = updatedAppointment.cancellationReason 
          ? `\nRazón: ${updatedAppointment.cancellationReason}` 
          : '';
        
        alert(`❌ Tu cita del ${appointmentDate} ha sido cancelada por el barbero.${reason}\n\n¡Puedes agendar una nueva cita!`);
      }
    });

    return () => newSocket.close();
  }, []);

  const searchMyAppointments = async () => {
    if (!searchData.name || !searchData.phone) {
      alert('Por favor ingresa tu nombre y teléfono');
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
        alert(data.error || 'Error al buscar turnos');
      }
    } catch (error) {
      console.error('Error searching appointments:', error);
      alert('Error al buscar turnos');
    } finally {
      setIsSearching(false);
    }
  };

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
        console.error('Error loading slots:', data.error);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      alert('Por favor selecciona fecha y hora');
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear la fecha/hora completa
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
        
        // Si estamos viendo "mis turnos" y coincide con la búsqueda, agregarlo
        if (showMyAppointments && 
            formData.clientName.toLowerCase() === searchData.name.toLowerCase() &&
            formData.clientPhone === searchData.phone) {
          setAppointments(prev => [newAppointment, ...prev]);
        }
        
        // Emitir nueva cita via socket
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
        alert('¡Turno confirmado! 🎉\n\nTu cita está programada para el ' + 
              new Date(requestData.scheduledAt).toLocaleDateString() + ' a las ' + 
              formData.time + '.\n\nPuedes ver tus turnos en "Ver Mis Turnos".');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled_by_barber': return 'bg-red-100 text-red-800';
      case 'cancelled_by_client': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'cancelled_by_barber': return 'Cancelada por barbero';
      case 'cancelled_by_client': return 'Cancelada por ti';
      case 'completed': return 'Completada';
      case 'rescheduled': return 'Reagendada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel Cliente</h1>
          <Link 
            href="/" 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Volver
          </Link>
        </div>

        {/* Botones de navegación */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowMyAppointments(false)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !showMyAppointments 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📝 Solicitar Turno
          </button>
          <button
            onClick={() => setShowMyAppointments(true)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              showMyAppointments 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👁️ Ver Mis Turnos
          </button>
        </div>

        {!showMyAppointments ? (
          /* Formulario de solicitud */
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Solicitar Turno</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  required
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu teléfono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="corte">Corte de cabello (30 min)</option>
                  <option value="barba">Arreglo de barba (20 min)</option>
                  <option value="corte-barba">Corte + Barba (45 min)</option>
                  <option value="afeitado">Afeitado completo (25 min)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora disponible
                </label>
                {isLoadingSlots ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    Cargando horarios...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <select
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una hora</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                ) : formData.date ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-red-50 text-red-600">
                    No hay horarios disponibles para esta fecha
                  </div>
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    Selecciona una fecha primero
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Alguna preferencia especial..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-md transition-colors"
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar Turno'}
              </button>
            </form>
          </div>
        ) : (
          /* Sección Ver Mis Turnos */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Buscar Mis Turnos</h2>
              <p className="text-gray-600 mb-4">
                Ingresa tu nombre y teléfono para ver tus turnos
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={searchData.name}
                    onChange={(e) => setSearchData({...searchData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={searchData.phone}
                    onChange={(e) => setSearchData({...searchData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Tu teléfono"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={searchMyAppointments}
                    disabled={isSearching}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    {isSearching ? 'Buscando...' : 'Buscar Turnos'}
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de turnos encontrados */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Mis Turnos</h2>
            
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {searchData.name || searchData.phone 
                      ? 'No se encontraron turnos con esos datos' 
                      : 'Ingresa tu nombre y teléfono para buscar tus turnos'
                    }
                  </p>
                ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{appointment.clientName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Servicio:</strong> {appointment.service}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Teléfono:</strong> {appointment.clientPhone}
                    </p>
                    
                    {appointment.scheduledAt && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Fecha programada:</strong> {new Date(appointment.scheduledAt).toLocaleString()}
                      </p>
                    )}
                    
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Notas:</strong> {appointment.notes}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      Solicitado: {new Date(appointment.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}