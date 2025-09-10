import pool from "@/lib/db";
import { NextResponse } from "next/server";

// GET → un cliente
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // 👈 await aquí
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM clientes WHERE id=$1", [id]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error en GET /clientes/:id:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT → actualizar cliente
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // 👈 await aquí
  try {
    const data = await req.json();
    const { nombre, apellido, email, telefono, direccion } = data;

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE clientes 
       SET nombre=$1, apellido=$2, email=$3, telefono=$4, direccion=$5
       WHERE id=$6 RETURNING *`,
      [nombre, apellido, email, telefono, direccion, id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error en PUT /clientes/:id:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE → eliminar cliente
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // 👈 await aquí
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM clientes WHERE id=$1 RETURNING *", [id]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cliente eliminado" });
  } catch (error: any) {
    console.error("Error en DELETE /clientes/:id:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
