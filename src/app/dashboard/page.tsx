// /app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [ventas, setVentas] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/ventas-totales')
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => setVentas(data.total))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {error && <p className="text-red-600">Error: {error}</p>}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold">Ventas totales</h2>
        <p className="text-3xl mt-2">
          {ventas !== null ? `$${ventas}` : 'Cargando...'}
        </p>
      </div>
    </div>
  );
}
