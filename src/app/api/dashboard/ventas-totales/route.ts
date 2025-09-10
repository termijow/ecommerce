// /app/api/dashboard/ventas-totales/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Prisma permite ejecutar consultas SQL "raw" (en crudo) de forma segura.
    // Usamos `queryRaw` porque esperamos que devuelva un valor.
    const result: { ventas_totales: number }[] = await prisma.$queryRaw`SELECT ventas_totales()`;

    // El resultado viene en un array con un objeto, ej: [{ ventas_totales: 1234.50 }]
    const total = result[0]?.ventas_totales ?? 0;

    return NextResponse.json({ totalVentas: total });
  } catch (error) {
    console.error("Error al obtener las ventas totales: ", error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}