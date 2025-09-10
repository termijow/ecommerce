// /app/components/ClientManager.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Prisma } from '@prisma/client'; // Importamos los tipos generados

// El tipo Cliente se infiere de nuestro schema. ¡Genial!
type Cliente = Prisma.clientesGetPayload<{}>;

export default function ClientManager() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para el formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // Función para cargar los clientes desde la API
  const fetchClientes = async () => {
    setIsLoading(true);
    const response = await fetch('/api/clientes');
    const data = await response.json();
    setClientes(data);
    setIsLoading(false);
  };

  // Cargar los clientes cuando el componente se monte
  useEffect(() => {
    fetchClientes();
  }, []);

  // Manejar el envío del formulario para crear un nuevo cliente
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email }),
    });

    if (response.ok) {
      // Limpiar formulario y recargar la lista de clientes
      setNombre('');
      setEmail('');
      fetchClientes();
    } else {
      const errorData = await response.text();
      setError(errorData || 'Error al crear el cliente');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Columna del Formulario */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Añadir Nuevo Cliente</h2>
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
          <div className="mb-4">
            <label htmlFor="nombre" className="block mb-1 font-medium">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Guardar Cliente
          </button>
        </form>
      </div>

      {/* Columna de la Lista de Clientes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Lista de Clientes</h2>
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="space-y-2">
            {clientes.map((cliente) => (
              <li key={cliente.id} className="p-3 border rounded-lg bg-white shadow-sm">
                <p className="font-semibold">{cliente.nombre} {cliente.apellido}</p>
                <p className="text-sm text-gray-600">{cliente.email}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}