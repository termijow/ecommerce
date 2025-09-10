// /app/api/clientes/route.ts
import pool from '@/lib/db';
import { NextResponse } from 'next/server';


export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM clientes ORDER BY nombre ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error al obtener clientes: ", error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { nombre, apellido, email, telefono, direccion } = data;
    

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO clientes (nombre, apellido, email, telefono, direccion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, apellido, email, telefono, direccion]
    );
    client.release();

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error en POST /clientes:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}