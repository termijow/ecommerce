-- I. CREACIÓN DE TABLAS

-- Tabla para usuarios del sistema (empleados, administradores)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Nunca guardes contraseñas en texto plano
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('administrador', 'empleado')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para productos y/o servicios
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id),
    usuario_id INT REFERENCES usuarios(id), -- El empleado que tomó el pedido (opcional)
    fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
    total NUMERIC(12, 2) NOT NULL
);

-- Tabla de detalle de pedido (tabla intermedia)
CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL -- Guarda el precio al momento de la compra
);

-- Tabla para devoluciones
CREATE TABLE devoluciones (
    id SERIAL PRIMARY KEY,
    pedido_item_id INT NOT NULL REFERENCES pedido_items(id),
    fecha_devolucion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    cantidad_devuelta INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'procesando' CHECK (estado IN ('procesando', 'aprobada', 'rechazada'))
);

-- II. CREACIÓN DE ROLES

-- 1. Rol de Administrador (diferente a 'postgres')
CREATE ROLE rol_administrador WITH LOGIN PASSWORD 'una_contraseña_segura_admin' SUPERUSER;
-- Nota: En un entorno de producción, es mejor dar permisos granulares en lugar de SUPERUSER.
-- ALTER ROLE rol_administrador SUPERUSER; sería para darle el privilegio.
-- Por seguridad, mejor dar todos los privilegios sobre las tablas del proyecto.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_administrador;


-- 2. Rol de Empleado (DELETE, UPDATE, pero no INSERT)
CREATE ROLE rol_empleado WITH LOGIN PASSWORD 'una_contraseña_segura_empleado';
GRANT CONNECT ON DATABASE tu_nombre_de_base_de_datos TO rol_empleado;
GRANT USAGE ON SCHEMA public TO rol_empleado;
-- Permisos específicos:
GRANT SELECT, UPDATE, DELETE ON usuarios, clientes, productos, pedidos, pedido_items, devoluciones TO rol_empleado;
-- Asegúrate de que no tenga INSERT
REVOKE INSERT ON ALL TABLES IN SCHEMA public FROM rol_empleado;
-- Permitirle usar las secuencias para los IDs es importante, pero no para crear nuevos.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_empleado;


-- 3. Rol de Cliente Estándar (solo SELECT)
CREATE ROLE rol_cliente_estandar WITH LOGIN PASSWORD 'una_contraseña_segura_cliente';
GRANT CONNECT ON DATABASE tu_nombre_de_base_de_datos TO rol_cliente_estandar;
GRANT USAGE ON SCHEMA public TO rol_cliente_estandar;
-- Permiso de solo lectura en las tablas que un cliente podría necesitar ver
GRANT SELECT ON productos, pedidos, pedido_items TO rol_cliente_estandar;

-- Recuerda reemplazar 'tu_nombre_de_base_de_datos' con el nombre real de tu BD.

-- II. CREACIÓN DE ROLES

-- 1. Rol de Administrador (diferente a 'postgres')
CREATE ROLE rol_administrador WITH LOGIN PASSWORD 'una_contraseña_segura_admin' SUPERUSER;
-- Nota: En un entorno de producción, es mejor dar permisos granulares en lugar de SUPERUSER.
-- ALTER ROLE rol_administrador SUPERUSER; sería para darle el privilegio.
-- Por seguridad, mejor dar todos los privilegios sobre las tablas del proyecto.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_administrador;


-- 2. Rol de Empleado (DELETE, UPDATE, pero no INSERT)
CREATE ROLE rol_empleado WITH LOGIN PASSWORD 'una_contraseña_segura_empleado';
GRANT CONNECT ON DATABASE tu_nombre_de_base_de_datos TO rol_empleado;
GRANT USAGE ON SCHEMA public TO rol_empleado;
-- Permisos específicos:
GRANT SELECT, UPDATE, DELETE ON usuarios, clientes, productos, pedidos, pedido_items, devoluciones TO rol_empleado;
-- Asegúrate de que no tenga INSERT
REVOKE INSERT ON ALL TABLES IN SCHEMA public FROM rol_empleado;
-- Permitirle usar las secuencias para los IDs es importante, pero no para crear nuevos.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_empleado;


-- 3. Rol de Cliente Estándar (solo SELECT)
CREATE ROLE rol_cliente_estandar WITH LOGIN PASSWORD 'una_contraseña_segura_cliente';
GRANT CONNECT ON DATABASE tu_nombre_de_base_de_datos TO rol_cliente_estandar;
GRANT USAGE ON SCHEMA public TO rol_cliente_estandar;
-- Permiso de solo lectura en las tablas que un cliente podría necesitar ver
GRANT SELECT ON productos, pedidos, pedido_items TO rol_cliente_estandar;

-- Recuerda reemplazar 'tu_nombre_de_base_de_datos' con el nombre real de tu BD.+

-- III. ELEMENTOS DE BASE DE DATOS

-- 1. PROCEDURE para registrar un pedido
CREATE OR REPLACE PROCEDURE registrar_pedido(
    p_cliente_id INT,
    p_usuario_id INT, -- Puede ser NULL si la compra es online sin empleado
    p_items JSONB -- Un array de JSON con { "producto_id": X, "cantidad": Y }
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_pedido_id INT;
    v_total_pedido NUMERIC(12, 2) := 0;
    v_item RECORD;
    v_precio_producto NUMERIC(10, 2);
BEGIN
    -- Calcular el total del pedido primero
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(producto_id INT, cantidad INT)
    LOOP
        SELECT precio INTO v_precio_producto FROM productos WHERE id = v_item.producto_id;
        v_total_pedido := v_total_pedido + (v_precio_producto * v_item.cantidad);
    END LOOP;

    -- Insertar en la tabla de pedidos y obtener el ID
    INSERT INTO pedidos (cliente_id, usuario_id, total)
    VALUES (p_cliente_id, p_usuario_id, v_total_pedido)
    RETURNING id INTO v_pedido_id;

    -- Insertar cada item en la tabla de detalle
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(producto_id INT, cantidad INT)
    LOOP
        SELECT precio INTO v_precio_producto FROM productos WHERE id = v_item.producto_id;
        INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (v_pedido_id, v_item.producto_id, v_item.cantidad, v_precio_producto);
        
        -- Aquí NO se actualiza el stock, el TRIGGER se encargará de eso.
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


-- 3. TRIGGER para actualizar el stock de productos

-- Primero, la función que ejecutará el trigger
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Al insertar un item en un pedido, disminuir el stock
        UPDATE productos
        SET stock = stock - NEW.cantidad
        WHERE id = NEW.producto_id;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Al eliminar un item (pedido cancelado), reponer el stock
        UPDATE productos
        SET stock = stock + OLD.cantidad
        WHERE id = OLD.producto_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Ahora, creamos el trigger que se asocia a la tabla pedido_items
CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT OR DELETE ON pedido_items
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();