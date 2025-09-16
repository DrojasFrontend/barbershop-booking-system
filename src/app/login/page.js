'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'barber') {
          router.push('/barbero');
        } else {
          setError('No tienes permisos de barbero');
        }
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-amber-400 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 border border-amber-400 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 border border-amber-400 rounded-full"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mb-4 shadow-lg">
              <span className="text-2xl">✂️</span>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2">
              Acceso Barbero
            </h1>
            <p className="text-gray-300">
              Inicia sesión para gestionar turnos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="Tu contraseña"
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:from-amber-300 disabled:to-yellow-300 text-black py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-400/50"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-gray-400 hover:text-amber-400 transition-colors duration-300 flex items-center justify-center"
            >
              <span className="mr-2">←</span> Volver al inicio
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gray-700/30 border border-gray-600/50 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-gray-300 mb-2">
              <strong className="text-amber-400">Credenciales de prueba:</strong>
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="text-amber-400">Email:</span> barbero@test.com</p>
              <p><span className="text-amber-400">Contraseña:</span> 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}