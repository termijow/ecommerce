// /app/api/productos/[id]/route.ts
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// Editar producto
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { nombre, descripcion, precio, stock } = await req.json();

    // Validaciones
    if (precio < 0) return NextResponse.json({ error: "El precio no puede ser negativo" }, { status: 400 });
    if (stock < 0) return NextResponse.json({ error: "El stock no puede ser negativo" }, { status: 400 });

    const client = await pool.connect();
    const result = await client.query(
      "UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, stock=$4 WHERE id=$5 RETURNING *",
      [nombre, descripcion, precio, stock, params.id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error en PUT /productos/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Eliminar producto
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "DELETE FROM productos WHERE id=$1 RETURNING *",
      [params.id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Producto eliminado", producto: result.rows[0] });
  } catch (error) {
    console.error("Error en DELETE /productos/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
