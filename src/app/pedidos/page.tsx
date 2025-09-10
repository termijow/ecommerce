// /app/pedidos/page.tsx
'use client';

import { useEffect, useState } from 'react';

const API_PEDIDOS = '/api/pedidos';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);

  const cargarPedidos = async () => {
    try {
      const res = await fetch(API_PEDIDOS);
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      setPedidos(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cambiarEstado = async (id: number, estado: string) => {
    try {
      const res = await fetch(`${API_PEDIDOS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        await cargarPedidos();
      } else {
        console.error("Error:", await res.json());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const eliminarPedido = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este pedido?")) return;
    try {
      const res = await fetch(`${API_PEDIDOS}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await cargarPedidos();
      } else {
        console.error("Error:", await res.json());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Gestión de Pedidos</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido: any) => (
              <tr key={pedido.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{pedido.id}</td>
                <td className="p-2 border">{pedido.cliente_id}</td>
                <td className="p-2 border font-semibold">
                  {pedido.estado === 'completado' ? (
                    <span className="text-green-600">Completado</span>
                  ) : (
                    <span className="text-yellow-600">Pendiente</span>
                  )}
                </td>
                <td className="p-2 border flex flex-wrap gap-2">
                  {pedido.estado !== 'completado' ? (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'completado')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Completar
                    </button>
                  ) : (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'pendiente')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Pendiente
                    </button>
                  )}
                  <button
                    onClick={() => eliminarPedido(pedido.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No hay pedidos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
