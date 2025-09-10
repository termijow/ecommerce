// /app/api/pedidos/route.ts
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

//  listar todos los pedidos
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
  "SELECT id, cliente_id, usuario_id, fecha_pedido, estado, total FROM pedidos ORDER BY id ASC"
);

    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en GET /pedidos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//  crear un pedido
export async function POST(req: Request) {
  try {
    const { cliente_id, usuario_id, items } = await req.json();

    if (!cliente_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Cliente e items son obligatorios" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    await client.query("BEGIN");

    // calcular total
    let total = 0;
    for (const item of items) {
      const productoRes = await client.query(
        "SELECT precio FROM productos WHERE id=$1",
        [item.producto_id]
      );
      if (productoRes.rows.length === 0) {
        await client.query("ROLLBACK");
        client.release();
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
      }
      total += Number(productoRes.rows[0].precio) * item.cantidad;
    }

    // insertar pedido
    const pedidoRes = await client.query(
      "INSERT INTO pedidos (cliente_id, usuario_id, estado, total) VALUES ($1, $2, $3, $4) RETURNING *",
      [cliente_id, usuario_id, "pendiente", total]
    );
    const pedidoId = pedidoRes.rows[0].id;

    // insertar items
    for (const item of items) {
      const productoRes = await client.query("SELECT precio FROM productos WHERE id=$1", [item.producto_id]);
      const precio_unitario = Number(productoRes.rows[0].precio);

      await client.query(
        "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)",
        [pedidoId, item.producto_id, item.cantidad, precio_unitario]
      );
    }

    await client.query("COMMIT");
    client.release();

    return NextResponse.json({ message: "Pedido creado", pedido: pedidoRes.rows[0] });
  } catch (error) {
    console.error("Error en POST /pedidos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
