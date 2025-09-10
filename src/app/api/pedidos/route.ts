// /app/api/pedidos/route.ts
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { cliente_id, usuario_id, items } = body;

    // Validación básica en el backend
    if (!cliente_id || !items || !Array.isArray(items) || items.length === 0) {
      return new NextResponse('Datos de pedido inválidos', { status: 400 });
    }

    client = await pool.connect();
    
    // Llamamos al Stored Procedure 'registrar_pedido'
    // La sintaxis de parámetros es $1, $2, etc.
    const query = 'CALL registrar_pedido($1, $2, $3::jsonb)';
    const values = [cliente_id, usuario_id, JSON.stringify(items)];

    await client.query(query, values);

    return new NextResponse('Pedido creado exitosamente', { status: 201 });
  } catch (error: any) {
    console.error("Error al crear el pedido:", error);
    // Podríamos devolver un error más específico si la base de datos nos lo da
    return new NextResponse(error.message || 'Error interno del servidor', { status: 500 });
  } finally {
    if (client) client.release();
  }
}