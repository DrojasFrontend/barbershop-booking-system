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
          setError('Access denied');
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center">
      <div className="max-w-md mx-auto px-6 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl mb-4 tracking-tight">BARBER</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Access Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm uppercase tracking-wide text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-transparent border-b border-gray-800 py-3 focus:outline-none focus:border-white transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm uppercase tracking-wide text-gray-400 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-transparent border-b border-gray-800 py-3 focus:outline-none focus:border-white transition-colors"
              placeholder="Your password"
            />
          </div>

          {error && (
            <div className="text-white text-sm text-center border border-gray-600 bg-gray-900 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-4 font-medium uppercase tracking-wide hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="text-gray-500 hover:text-gray-300 text-sm uppercase tracking-wide transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="mt-12 p-4 border border-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Demo Access</p>
          <p className="text-xs text-gray-500">
            Email: barbero@test.com<br />
            Password: 123456
          </p>
        </div>
      </div>
    </div>
  );
}