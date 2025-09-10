// /app/api/pedidos/[id]/route.ts
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// actualizar estado
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { estado } = await req.json();

    const client = await pool.connect();
    const result = await client.query(
      "UPDATE pedidos SET estado=$1 WHERE id=$2 RETURNING *",
      [estado, id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// eliminar pedido
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM pedidos WHERE id=$1 RETURNING *", [id]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pedido eliminado correctamente" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
