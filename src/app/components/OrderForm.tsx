// /app/components/OrderForm.tsx
'use client';

import { useState, useEffect } from 'react';

// Definimos los tipos de datos que recibiremos de la API
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}
interface Cliente {
  id: number;
  nombre: string;
  apellido: string | null;
}
interface CartItem extends Producto {
  cantidad: number;
}

export default function OrderForm() {
  // Estados para cargar datos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el formulario
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Estados para notificaciones
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Cargar clientes y productos al iniciar
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [productsRes, clientsRes] = await Promise.all([
          fetch('/api/productos'),
          fetch('/api/clientes'),
        ]);
        const productsData = await productsRes.json();
        const clientsData = await clientsRes.json();
        setProductos(productsData);
        setClientes(clientsData);
      } catch (err) {
        setError('Error al cargar datos iniciales.');
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Función para añadir un producto al carrito
  const addToCart = (producto: Producto) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === producto.id);
      if (existingItem) {
        // Incrementar cantidad si ya existe
        return prevCart.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      // Añadir nuevo item al carrito
      return [...prevCart, { ...producto, cantidad: 1 }];
    });
  };

  // Calcular el total del carrito
  const cartTotal = cart.reduce((total, item) => total + Number(item.precio) * item.cantidad, 0);

  // Función para enviar el pedido
  const handleSubmitOrder = async () => {
    setError('');
    setMessage('');
    if (!selectedClientId) {
      setError('Por favor, selecciona un cliente.');
      return;
    }
    if (cart.length === 0) {
      setError('El carrito está vacío.');
      return;
    }

    // Formatear los items del carrito para el procedure
    const orderItems = cart.map(item => ({
      producto_id: item.id,
      cantidad: item.cantidad,
    }));
    
    // Aquí puedes añadir el ID del usuario (empleado) que está logueado
    const orderPayload = {
      cliente_id: selectedClientId,
      usuario_id: null, // Opcional: Reemplazar con el ID del empleado logueado
      items: orderItems,
    };

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear el pedido');
      }
      
      setMessage('¡Pedido creado exitosamente!');
      setCart([]);
      setSelectedClientId('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) return <p>Cargando formulario de pedidos...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
      {/* Columna de Productos y Clientes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">1. Selecciona Cliente y Productos</h2>
        <div className="mb-4">
          <label htmlFor="cliente" className="block font-medium mb-1">Cliente:</label>
          <select
            id="cliente"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>-- Selecciona un cliente --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          {productos.map(p => (
            <div key={p.id} className="flex justify-between items-center p-2 border rounded">
              <span>{p.nombre} (${Number(p.precio).toFixed(2)}) - Stock: {p.stock}</span>
              <button
                onClick={() => addToCart(p)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Añadir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Columna del Carrito */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">2. Carrito de Compras</h2>
        {cart.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.nombre} x {item.cantidad}</span>
                <span>${(Number(item.precio) * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSubmitOrder}
              className="w-full bg-green-500 text-white p-3 rounded mt-4 hover:bg-green-600"
            >
              Confirmar Pedido
            </button>
            {message && <p className="text-green-600 mt-2">{message}</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}