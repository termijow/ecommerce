// /lib/db.ts
import { Pool } from 'pg';

// Declaramos una variable global para almacenar el pool, similar a como lo hacíamos con Prisma.
// Esto evita que se creen múltiples pools de conexión durante el desarrollo (hot-reloading).
declare global {
  var pgPool: Pool | undefined;
}

// Función para crear o retornar la instancia del pool existente.
function getPool(): Pool {
  // Si estamos en desarrollo y ya existe una instancia global, la reutilizamos.
  if (process.env.NODE_ENV === 'development' && global.pgPool) {
    return global.pgPool;
  }

  // Creamos una nueva instancia del pool con la configuración de las variables de entorno.
  const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || '5432', 10),
    // Configuración SSL importante para el despliegue en Vercel y otros servicios.
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Si estamos en desarrollo, guardamos la nueva instancia en la variable global.
  if (process.env.NODE_ENV === 'development') {
    global.pgPool = pool;
  }

  return pool;
}

// Creamos la instancia una sola vez y la exportamos.
const pool = getPool();

export default pool;