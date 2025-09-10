// app/components/ProductList.tsx
'use client'; // Esta directiva es crucial para usar hooks como useState y useEffect

import { useState, useEffect } from 'react';

// Definimos un tipo para nuestros productos para tener autocompletado y seguridad.
// Coincide con la estructura de nuestra tabla 'productos'.
interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number; // Prisma convierte el tipo Decimal de SQL a number en JS
  stock: number;
}

export default function ProductList() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductos() {
      try {
        // Hacemos la llamada a nuestra API de Next.js
        const response = await fetch('/api/productos');

        if (!response.ok) {
          throw new Error('La respuesta de la red no fue exitosa');
        }

        const data: Producto[] = await response.json();
        setProductos(data);
      } catch (err) {
        // Capturamos cualquier error en la llamada
        setError('No se pudieron cargar los productos. ¿La API está funcionando?');
        console.error(err);
      } finally {
        // Ocultamos el mensaje de "Cargando..." sin importar si hubo éxito o error
        setLoading(false);
      }
    }

    fetchProductos();
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez, cuando el componente se monta.

  // --- Renderizado Condicional ---
  if (loading) {
    return <p className="text-center text-gray-500">Cargando productos desde la base de datos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 font-bold">{error}</p>;
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Catálogo de Productos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((producto) => (
          <div key={producto.id} className="border bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-700">{producto.nombre}</h3>
            <p className="text-gray-600 my-2">{producto.descripcion}</p>
            <div className="flex justify-between items-center mt-4">
              <p className="text-lg font-bold">${Number(producto.precio).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Stock: {producto.stock}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}