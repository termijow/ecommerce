import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT d.*, p.nombre AS producto_nombre
      FROM devoluciones d
      JOIN pedido_items pi ON pi.id = d.pedido_item_id
      JOIN productos p ON p.id = pi.producto_id
      ORDER BY d.id ASC
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener devoluciones' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const { pedido_item_id, cantidad_devuelta, motivo } = await req.json();

    // 1. Consultar cantidad del pedido
    const pedidoRes = await pool.query(
      'SELECT cantidad FROM pedido_items WHERE id = $1',
      [pedido_item_id]
    );
    if (pedidoRes.rowCount === 0) {
      return NextResponse.json({ error: 'Pedido item no encontrado' }, { status: 400 });
    }
    const cantidadPedido = pedidoRes.rows[0].cantidad;

    // 2. Consultar devoluciones previas de este item
    const devsRes = await pool.query(
      'SELECT COALESCE(SUM(cantidad_devuelta),0) as total_devuelto FROM devoluciones WHERE pedido_item_id = $1',
      [pedido_item_id]
    );
    const totalDevuelto = Number(devsRes.rows[0].total_devuelto);

    // 3. Validar cantidad
    if (cantidad_devuelta + totalDevuelto > cantidadPedido) {
      return NextResponse.json({ 
        error: `Cantidad inválida. Solo puedes devolver hasta ${cantidadPedido - totalDevuelto}` 
      }, { status: 400 });
    }

    // 4. Insertar devolución
    const res = await pool.query(
      `INSERT INTO devoluciones (pedido_item_id, cantidad_devuelta, motivo, estado)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [pedido_item_id, cantidad_devuelta, motivo, 'procesando']
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar devolución' }, { status: 500 });
  }
}
