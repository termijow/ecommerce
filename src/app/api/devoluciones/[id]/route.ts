// /app/api/productos/[id]/route.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
// Desactivamos la regla de 'any' para todo el archivo

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// --- OBTENER UN PRODUCTO POR SU ID ---
export async function GET(request: NextRequest, context: any) {
  let client;
  try {
    const id = parseInt(context?.params?.id, 10);
    if (isNaN(id)) {
      return new NextResponse('ID de producto inválido', { status: 400 });
    }

    client = await pool.connect();
    const result = await client.query('SELECT * FROM productos WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return new NextResponse(`Producto con ID ${id} no encontrado`, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error en GET /api/productos/[id]:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// --- ACTUALIZAR UN PRODUCTO (MÉTODO PUT) ---
export async function PUT(request: NextRequest, context: any) {
  let client;
  try {
    const id = parseInt(context?.params?.id, 10);
    if (isNaN(id)) {
      return new NextResponse('ID de producto inválido', { status: 400 });
    }

    const { nombre, descripcion, precio, stock } = await request.json();
    if (!nombre || precio === undefined || stock === undefined) {
      return new NextResponse('Nombre, precio y stock son requeridos', { status: 400 });
    }

    client = await pool.connect();
    const query = `
      UPDATE productos
      SET nombre = $1, descripcion = $2, precio = $3, stock = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [nombre, descripcion, precio, stock, id];
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return new NextResponse(`Producto con ID ${id} no encontrado`, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error en PUT /api/productos/[id]:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// --- ELIMINAR UN PRODUCTO ---
export async function DELETE(request: NextRequest, context: any) {
    let client;
    try {
        const id = parseInt(context?.params?.id, 10);
        if (isNaN(id)) {
            return new NextResponse('ID de producto inválido', { status: 400 });
        }

        client = await pool.connect();
        const result = await client.query('DELETE FROM productos WHERE id = $1 RETURNING *;', [id]);

        if (result.rowCount === 0) {
            return new NextResponse(`Producto con ID ${id} no encontrado`, { status: 404 });
        }

        return NextResponse.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error en DELETE /api/productos/[id]:', error);
        return new NextResponse('Error interno del servidor', { status: 500 });
    } finally {
        if (client) client.release();
    }
}