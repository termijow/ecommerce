// /app/layout.tsx
'use client'; 

import './globals.css';
import Link from 'next/link';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800">
        {/* Barra de navegación */}
        <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow">
          <div className="flex items-center gap-3">
            <Link href="/"><img src="/logo.png" alt="Logo" className="h-8" /></Link>
            
            <span className="font-bold text-lg"></span>
          </div>

          {/* Menú responsive */}
          <div className="hidden md:flex gap-3">
            <Link href="/productos">Productos</Link>
            <Link href="/pedidos">Pedidos</Link>
            <Link href="/devoluciones">Devoluciones</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/clientes">Clientes</Link>
            <Link href="/login">Iniciar sesión</Link>
            <Link href="/register">Registrarse</Link>
          </div>

          {/* Botón menú móvil */}
          <button
            className="md:hidden bg-blue-700 p-2 rounded"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </nav>

        {/* Menú desplegable móvil */}
        {menuOpen && (
          <div className="md:hidden bg-blue-600 text-white flex flex-col gap-2 p-4">
            <Link href="/">Inicio</Link>
            <Link href="/productos">Productos</Link>
            <Link href="/pedidos">Pedidos</Link>
            <Link href="/devoluciones">Devoluciones</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/clientes">Clientes</Link>
            <Link href="/login">Iniciar sesión</Link>
            <Link href="/register">Registrarse</Link>
          </div>
        )}

        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
