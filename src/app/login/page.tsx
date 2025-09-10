'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      localStorage.setItem('token', data.token); // Guardamos JWT
      setMessage('Login exitoso ✅');
      router.push('/'); // Redirige al inicio
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-medium transition">
            Entrar
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-red-600 sm:text-base">{message}</p>
        )}
      </div>
    </div>
  );
}
