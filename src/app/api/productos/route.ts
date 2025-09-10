// app/api/productos/route.ts

import pool from '@/lib/db'; // Importamos nuestro pool de conexiones
import { NextResponse } from 'next/server';

// Esta función se encarga de manejar las peticiones GET a /api/productos
export async function GET() {
  let client;
  try {
    // 1. Pide una conexión del pool
    client = await pool.connect();
    
    // 2. Ejecuta la consulta SQL para seleccionar todos los productos
    const result = await client.query('SELECT * FROM productos ORDER BY id ASC');
    
    // 3. Devuelve los resultados (`result.rows`) como una respuesta JSON
    // NextResponse.json se encarga de formatear la respuesta correctamente
    return NextResponse.json(result.rows);

  } catch (error) {
    // Si algo sale mal (ej: la tabla no existe, la conexión falla)
    console.error("Error al obtener productos desde la API: ", error);
    // Devuelve un error 500 para indicar que algo falló en el servidor
    return new NextResponse('Error interno del servidor al consultar productos', { status: 500 });
  } finally {
    // 4. Libera la conexión de vuelta al pool, tanto si hubo éxito como si hubo error
    if (client) {
      client.release();
    }
  }
}