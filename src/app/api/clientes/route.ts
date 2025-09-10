// /app/api/clientes/route.ts

import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// --- OBTENER TODOS LOS CLIENTES ---
export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT id, nombre, apellido, email FROM clientes ORDER BY nombre ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error al obtener clientes: ", error); // Loguear el objeto de error completo
    return new NextResponse('Error interno del servidor al obtener clientes', { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// --- CREAR UN NUEVO CLIENTE ---
export async function POST(request: NextRequest) {
  let client;
  try {
    // 1. Obtener los datos del cuerpo de la petición
    const data = await request.json();
    const { nombre, apellido, email, telefono, direccion } = data;

    // 2. Validación de datos de entrada
    if (!nombre || !email) {
      return NextResponse.json(
        { message: 'El nombre y el email son campos requeridos.' },
        { status: 400 }
      );
    }

    // 3. Conectarse a la base de datos e insertar el nuevo cliente
    client = await pool.connect();
    const query = `
      INSERT INTO clientes (nombre, apellido, email, telefono, direccion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [nombre, apellido, email, telefono, direccion];
    
    const result = await client.query(query, values);

    // 4. Devolver el cliente recién creado con un código de estado 201 (Creado)
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) { // <-- ¡Aquí está la clave! No se especifica el tipo
    console.error("Error en POST /api/clientes:", error);

    // 5. Manejo de errores robusto
    let errorMessage = 'Ocurrió un error en el servidor.';
    let statusCode = 500;

    // Verificar si es un error de la base de datos (pg)
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; detail?: string };
      // Código '23505' es para violación de 'unique constraint' (email duplicado)
      if (dbError.code === '23505') {
        errorMessage = 'El email proporcionado ya está registrado.';
        statusCode = 409; // 409 Conflict
      }
    } 
    // Si no es un error de BD, pero es una instancia de Error, usamos su mensaje
    else if (error instanceof Error) {
        errorMessage = error.message;
    }

    // Devolver una respuesta de error JSON formateada
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  } finally {
    // 6. Asegurarse de liberar la conexión
    if (client) {
      client.release();
    }
  }
}