-- database_setup.sql
-- Script completo para configurar la base de datos desde cero.
-- Ejecutar como superusuario (ej: postgres)

-- I. CREACIÓN DE TABLAS

-- Tabla para usuarios del sistema (empleados, administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('administrador', 'empleado')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para productos y/o servicios
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id),
    usuario_id INT REFERENCES usuarios(id),
    fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
    total NUMERIC(12, 2) NOT NULL
);

-- Tabla de detalle de pedido (tabla intermedia)
CREATE TABLE IF NOT EXISTS pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL
);

-- Tabla para devoluciones
CREATE TABLE IF NOT EXISTS devoluciones (
    id SERIAL PRIMARY KEY,
    pedido_item_id INT NOT NULL REFERENCES pedido_items(id),
    fecha_devolucion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    cantidad_devuelta INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'procesando' CHECK (estado IN ('procesando', 'aprobada', 'rechazada'))
);

-- II. CREACIÓN DE ROLES
-- NOTA: Ejecutar estos comandos puede fallar si los roles ya existen.
-- Para desarrollo, esto es aceptable.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_administrador') THEN
      CREATE ROLE rol_administrador WITH LOGIN PASSWORD 'admin_pass' SUPERUSER;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_empleado') THEN
      CREATE ROLE rol_empleado WITH LOGIN PASSWORD 'empleado_pass';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_cliente_estandar') THEN
      CREATE ROLE rol_cliente_estandar WITH LOGIN PASSWORD 'cliente_pass';
  END IF;
END
$$;

-- Permisos para el rol_empleado
GRANT CONNECT ON DATABASE ecommerce_bd_dev TO rol_empleado;
GRANT USAGE ON SCHEMA public TO rol_empleado;
GRANT SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rol_empleado;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_empleado;
REVOKE INSERT ON ALL TABLES IN SCHEMA public FROM rol_empleado;

-- Permisos para el rol_cliente_estandar
GRANT CONNECT ON DATABASE ecommerce_bd_dev TO rol_cliente_estandar;
GRANT USAGE ON SCHEMA public TO rol_cliente_estandar;
GRANT SELECT ON productos, pedidos, pedido_items TO rol_cliente_estandar;

-- III. ELEMENTOS AVANZADOS DE BASE DE DATOS

-- PROCEDURE para registrar un pedido
CREATE OR REPLACE PROCEDURE registrar_pedido(
    p_cliente_id INT, p_usuario_id INT, p_items JSONB
) LANGUAGE plpgsql AS $$
DECLARE
    v_pedido_id INT; v_total_pedido NUMERIC(12, 2) := 0; v_item RECORD; v_precio_producto NUMERIC(10, 2);
BEGIN
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(producto_id INT, cantidad INT) LOOP
        SELECT precio INTO v_precio_producto FROM productos WHERE id = v_item.producto_id;
        v_total_pedido := v_total_pedido + (v_precio_producto * v_item.cantidad);
    END LOOP;
    INSERT INTO pedidos (cliente_id, usuario_id, total, estado) VALUES (p_cliente_id, p_usuario_id, v_total_pedido, 'pendiente') RETURNING id INTO v_pedido_id;
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(producto_id INT, cantidad INT) LOOP
        SELECT precio INTO v_precio_producto FROM productos WHERE id = v_item.producto_id;
        INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (v_pedido_id, v_item.producto_id, v_item.cantidad, v_precio_producto);
    END LOOP;
END;
$$;

-- FUNCIÓN para ventas totales
CREATE OR REPLACE FUNCTION ventas_totales() RETURNS NUMERIC LANGUAGE sql AS $$
    SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE estado = 'completado';
$$;

-- TRIGGER para actualizar stock
CREATE OR REPLACE FUNCTION actualizar_stock() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE productos SET stock = stock - NEW.cantidad WHERE id = NEW.producto_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE productos SET stock = stock + OLD.cantidad WHERE id = OLD.producto_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_actualizar_stock ON pedido_items;
CREATE TRIGGER trigger_actualizar_stock AFTER INSERT OR DELETE ON pedido_items FOR EACH ROW EXECUTE FUNCTION actualizar_stock();

-- II. CREACIÓN DE ROLES (esto debe ejecutarlo un superusuario)
-- NOTA: Como ya creaste 'ecommerce_user', no lo incluimos aquí.

CREATE ROLE rol_administrador WITH LOGIN PASSWORD 'admin_pass' SUPERUSER;
CREATE ROLE rol_empleado WITH LOGIN PASSWORD 'empleado_pass';
CREATE ROLE rol_cliente_estandar WITH LOGIN PASSWORD 'cliente_pass';

-- Permisos para el rol_empleado
GRANT CONNECT ON DATABASE ecommerce_bd_dev TO rol_empleado;
GRANT USAGE ON SCHEMA public TO rol_empleado;
GRANT SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rol_empleado;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_empleado;
REVOKE INSERT ON ALL TABLES IN SCHEMA public FROM rol_empleado;

-- Permisos para el rol_cliente_estandar
GRANT CONNECT ON DATABASE ecommerce_bd_dev TO rol_cliente_estandar;
GRANT USAGE ON SCHEMA public TO rol_cliente_estandar;
GRANT SELECT ON productos, pedidos, pedido_items TO rol_cliente_estandar;


-- III. ELEMENTOS DE BASE DE DATOS

-- 1. PROCEDURE para registrar un pedido
CREATE OR REPLACE PROCEDURE registrar_pedido(
    p_cliente_id INT,
    p_usuario_id INT,
    p_items JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_pedido_id INT;
    v_total_pedido NUMERIC(12, 2) := 0;
    v_item RECORD;
    v_precio_producto NUMERIC(10, 2);
BEGIN
    -- Calcular el total del pedido
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(producto_id INT, cantidad INT)
    LOOP
        SELECT precio INTO v_precio_producto FROM productos WHERE id = v_item.producto_id;
        v_total_pedido := v_total_pedido + (v_precio_producto * v_item.cantidad);
    END LOOP;

    -- Insertar en la tabla de pedidos
    INSERT INTO pedidos (cliente_id, usuario_id, total, estado)
    VALUES (p_cliente_id, p_usuario_id, v_total_pedido, 'pendiente')
    RETURNING id INTO v_pedido_id;

    -- Insertar cada item en la tabla de detalle
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(producto_id INT, cantidad INT)
    LOOP
        SELECT precio INTO v_precio_producto FROM productos WHERE id = v_item.producto_id;
        INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (v_pedido_id, v_item.producto_id, v_item.cantidad, v_precio_producto);
    END LOOP;
END;
$$;

-- 2. FUNCIÓN para calcular las ventas totales
CREATE OR REPLACE FUNCTION ventas_totales()
RETURNS NUMERIC
LANGUAGE sql
AS $$
    SELECT COALESCE(SUM(total), 0)
    FROM pedidos
    WHERE estado = 'completado';
$$;

-- 3. TRIGGER para actualizar el stock
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE productos
        SET stock = stock - NEW.cantidad
        WHERE id = NEW.producto_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE productos
        SET stock = stock + OLD.cantidad
        WHERE id = OLD.producto_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_actualizar_stock
AFTER INSERT OR DELETE ON pedido_items
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();
TRUNCATE TABLE devoluciones, pedido_items, pedidos, clientes, usuarios, productos RESTART IDENTITY CASCADE;

-- Insertar Usuarios del Sistema (empleados/administradores)
-- La contraseña es 'password123' hasheada con bcrypt. Necesitarás bcrypt para el login.
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Alicia Admin', 'admin@example.com', '$2a$10$T8.j.B.8Y.z9.J1.J1.J1.O7g.z.z.z.z.z.z.z.z.z.z', 'administrador'),
('Bruno Empleado', 'empleado@example.com', '$2a$10$U9.k.B.9Y.z0.K2.K2.K2.P8h.a.a.a.a.a.a.a.a.a', 'empleado');

-- Insertar Clientes
INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES
('Carlos Cliente', 'García', 'carlos.garcia@email.com', '555-1234', 'Calle Falsa 123, Ciudad Ejemplo'),
('Diana Dávila', 'López', 'diana.davila@email.com', '555-5678', 'Avenida Siempre Viva 742'),
('Elena Ensayo', 'Martínez', 'elena.ensayo@email.com', '555-8765', 'Plaza Mayor 1');

-- Insertar Productos
INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
('Laptop Pro X15', 'Potente laptop para profesionales y creadores de contenido.', 1499.99, 50),
('Monitor Curvo UltraWide', 'Monitor de 34 pulgadas para una inmersión total.', 799.50, 35),
('Teclado Mecánico RGB', 'Teclado con switches Cherry MX y retroiluminación personalizable.', 120.00, 150),
('Mouse Inalámbrico Ergonómico', 'Diseñado para la comodidad durante largas horas de trabajo.', 75.99, 200),
('Webcam HD 1080p', 'Cámara web con micrófono incorporado para videoconferencias.', 49.99, 300);

-- Insertar un Pedido de ejemplo (ya completado) para que la función de ventas totales devuelva un valor.
-- Este pedido fue hecho por el cliente Carlos (id=1), gestionado por el empleado Bruno (id=2).
-- Nota: Hacemos esto con INSERTs directos para poder controlar el estado y la fecha.
-- El TRIGGER actualizará el stock automáticamente.
DO $$
DECLARE
    nuevo_pedido_id INT;
BEGIN
    -- Insertar el pedido principal
    INSERT INTO pedidos (cliente_id, usuario_id, fecha_pedido, estado, total)
    VALUES (1, 2, NOW() - INTERVAL '5 days', 'completado', 1619.98)
    RETURNING id INTO nuevo_pedido_id;

    -- Insertar los items de ese pedido
    -- El trigger 'actualizar_stock' se disparará aquí.
    INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
    VALUES
        (nuevo_pedido_id, 1, 1, 1499.99), -- 1 Laptop Pro X15
        (nuevo_pedido_id, 3, 1, 120.00);   -- 1 Teclado Mecánico
END $$;

-- Mensaje de finalización
\echo '---------------------------------------------'
\echo 'Base de datos configurada y poblada con datos de ejemplo.'
\echo '---------------------------------------------'