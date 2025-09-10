// /app/api/clientes/route.ts
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT id, nombre, apellido, email FROM clientes ORDER BY nombre ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error al obtener clientes: ", error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  } finally {
    if (client) client.release();
  }
}