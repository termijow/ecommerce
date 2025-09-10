// /app/api/devoluciones/[id]/route.ts
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { estado } = await req.json();

    const res = await pool.query(
      'UPDATE devoluciones SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await pool.query('DELETE FROM devoluciones WHERE id = $1', [id]);
    return NextResponse.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
