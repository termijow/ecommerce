// /app/devoluciones/page.tsx
'use client';

import { useEffect, useState } from 'react';

const API_DEVOLUCIONES = '/api/devoluciones';

export default function DevolucionesPage() {
  const [devoluciones, setDevoluciones] = useState<any[]>([]);
  const [pedidoItemId, setPedidoItemId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [motivo, setMotivo] = useState<string>('');

  const cargarDevoluciones = async () => {
    const res = await fetch(API_DEVOLUCIONES);
    const data = await res.json();
    setDevoluciones(data);
  };

  useEffect(() => {
    cargarDevoluciones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedidoItemId || cantidad <= 0 || !motivo) return alert('Todos los campos son obligatorios');

    const res = await fetch(API_DEVOLUCIONES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedido_item_id: pedidoItemId, cantidad_devuelta: cantidad, motivo }),
    });

    if (res.ok) {
      setPedidoItemId(null);
      setCantidad(0);
      setMotivo('');
      cargarDevoluciones();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    await fetch(`${API_DEVOLUCIONES}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    cargarDevoluciones();
  };

  const eliminarDevolucion = async (id: number) => {
    await fetch(`${API_DEVOLUCIONES}/${id}`, { method: 'DELETE' });
    cargarDevoluciones();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">Gestión de Devoluciones</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="number"
          placeholder="ID del pedido item"
          value={pedidoItemId ?? ''}
          onChange={(e) => setPedidoItemId(Number(e.target.value))}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="number"
          placeholder="Cantidad a devolver"
          value={cantidad}
          min={1}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          placeholder="Motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <button className="sm:col-span-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Registrar Devolución
        </button>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border min-w-[600px]">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Pedido Item</th>
              <th className="p-2 border">Producto</th>
              <th className="p-2 border">Cantidad</th>
              <th className="p-2 border">Motivo</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devoluciones.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{d.id}</td>
                <td className="p-2 border">{d.pedido_item_id}</td>
                <td className="p-2 border">{d.producto_nombre || '-'}</td>
                <td className="p-2 border">{d.cantidad_devuelta}</td>
                <td className="p-2 border">{d.motivo}</td>
                <td className="p-2 border font-semibold">
                  {d.estado === 'aprobada' ? (
                    <span className="text-green-600">Aprobada</span>
                  ) : d.estado === 'rechazada' ? (
                    <span className="text-red-600">Rechazada</span>
                  ) : (
                    <span className="text-yellow-600">Procesando</span>
                  )}
                </td>
                <td className="p-2 border flex gap-2 flex-wrap">
                  {['procesando', 'aprobada', 'rechazada'].map(
                    (est) =>
                      d.estado !== est && (
                        <button
                          key={est}
                          onClick={() => cambiarEstado(d.id, est)}
                          className={`px-2 py-1 rounded text-white ${
                            est === 'aprobada'
                              ? 'bg-green-500 hover:bg-green-600'
                              : est === 'rechazada'
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          }`}
                        >
                          {est.charAt(0).toUpperCase() + est.slice(1)}
                        </button>
                      )
                  )}
                  <button
                    onClick={() => eliminarDevolucion(d.id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
