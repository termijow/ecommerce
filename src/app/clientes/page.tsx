'use client';
import { useEffect, useState } from "react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
  const [editId, setEditId] = useState<number | null>(null);

  async function fetchClientes() {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error('Error al obtener clientes', err);
    }
  }

  useEffect(() => { fetchClientes(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editId) {
        await fetch(`/api/clientes/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setForm({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
      setEditId(null);
      fetchClientes();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar cliente?")) return;
    try {
      await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      fetchClientes();
    } catch(err){
      console.error('Error al eliminar cliente:', err);
    }
  }

  function handleEdit(cliente: any) {
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido || "",
      email: cliente.email,
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
    });
    setEditId(cliente.id);
  }

  function handleCancelEdit(){
    setForm({ nombre:'', apellido:'', email:'', telefono:'', direccion:'' });
    setEditId(null);
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <input
          className="border p-2 rounded w-full"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
        />
        <input
          className="border p-2 rounded w-full sm:col-span-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Teléfono"
          pattern="[0-9]{7,15}"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Dirección"
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />
        <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">
            {editId ? "Actualizar Cliente" : "Registrar Cliente"}
          </button>
          {editId && (
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded w-full sm:w-auto"
              onClick={handleCancelEdit}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Teléfono</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{cliente.id}</td>
                <td className="border px-2 py-1">{cliente.nombre} {cliente.apellido}</td>
                <td className="border px-2 py-1">{cliente.email}</td>
                <td className="border px-2 py-1">{cliente.telefono}</td>
                <td className="border px-2 py-1 flex flex-col sm:flex-row gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(cliente)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(cliente.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
