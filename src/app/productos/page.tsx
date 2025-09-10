'use client';
import { useEffect, useState } from 'react';

const API_URL = '/api/productos';

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: 0, stock: 0 });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const res = await fetch(API_URL);
    const data = await res.json();
    setProductos(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/${editId}` : API_URL;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ nombre: '', descripcion: '', precio: 0, stock: 0 });
      setEditId(null);
      fetchProductos();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  }

  function handleEdit(producto: any) {
    setForm(producto);
    setEditId(producto.id);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchProductos();
    } else {
      const error = await res.json();
      alert(error.error);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Gestión de Productos</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="Precio"
          value={form.precio}
          min={0}
          onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
          className="border p-2 w-full"
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          min={0}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          className="border p-2 w-full"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? 'Actualizar' : 'Crear'}
        </button>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Descripción</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{p.id}</td>
                <td className="p-2 border">{p.nombre}</td>
                <td className="p-2 border">{p.descripcion}</td>
                <td className="p-2 border">${p.precio}</td>
                <td className="p-2 border">{p.stock}</td>
                <td className="p-2 border flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
