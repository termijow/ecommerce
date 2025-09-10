// /app/api/dashboard/ventas-totales/route.ts

import pool from '@/lib/db'; // Importamos nuestro pool de conexiones de 'pg'
import { NextResponse } from 'next/server';

export async function GET() {
  let client;
  try {
    // 1. Obtener una conexión del pool
    client = await pool.connect();
    
    // 2. Ejecutar la consulta para llamar a nuestra función de PostgreSQL
    const result = await client.query('SELECT ventas_totales()');
    
    // 3. Extraer el valor del resultado.
    // Con 'pg', el resultado de una consulta siempre está en `result.rows`.
    // La consulta devuelve un array con un solo objeto, ej: [{ ventas_totales: '1619.98' }]
    // Accedemos a la primera fila (índice 0) y a la propiedad 'ventas_totales'.
    const total = result.rows[0]?.ventas_totales ?? 0;

    // 4. Devolver la respuesta en formato JSON.
    // Convertimos el total a número por si viene como string.
    return NextResponse.json({ totalVentas: Number(total) });

  } catch (error) {
    console.error("Error al obtener las ventas totales: ", error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  } finally {
    // 5. Liberar la conexión de vuelta al pool.
    if (client) {
      client.release();
    }
  }
}