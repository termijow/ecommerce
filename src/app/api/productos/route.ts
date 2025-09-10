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

// Crear producto
export async function POST(req: Request) {
  try {
    const { nombre, descripcion, precio, stock } = await req.json();

    // Validaciones
    if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    if (precio < 0) return NextResponse.json({ error: "El precio no puede ser negativo" }, { status: 400 });
    if (stock < 0) return NextResponse.json({ error: "El stock no puede ser negativo" }, { status: 400 });

    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, descripcion, precio, stock]
    );
    client.release();

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error en POST /productos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}