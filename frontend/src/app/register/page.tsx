'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { getApiErrorMessage } from '@/lib/errors';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'individual' | 'club'>('individual');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(email, password, fullName, userType);
      window.location.href = '/login';
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao criar conta'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Football Analytics
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Crie sua conta para começar
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            label="Nome completo"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo de conta</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="individual"
                  checked={userType === 'individual'}
                  onChange={(e) => setUserType(e.target.value as 'individual' | 'club')}
                  className="mr-2"
                />
                <span>Individual</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="club"
                  checked={userType === 'club'}
                  onChange={(e) => setUserType(e.target.value as 'individual' | 'club')}
                  className="mr-2"
                />
                <span>Clube</span>
              </label>
            </div>
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-blue-600 hover:underline">
              Já tem conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
