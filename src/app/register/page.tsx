// /app/register/page.tsx
'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage('Usuario registrado con éxito 🎉');
      setForm({ nombre: '', email: '', password: '' });
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-4 sm:p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">Registro</h1>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Registrarse
        </button>
      </form>

      {message && (
        <p className="mt-3 text-center sm:text-left text-gray-700">{message}</p>
      )}
    </div>
  );
}
