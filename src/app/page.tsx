// /app/page.tsx
import ProductList from './components/ProductList';
import OrderForm from './components/OrderForm';

export default function HomePage() {
  return (
    <main className="container mx-auto p-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-gray-800">
          Sistema de Gestión
        </h1>
      </header>
      
      {/* Sección para crear nuevos pedidos */}
      <section id="crear-pedido">
        <OrderForm />
      </section>

      <hr className="my-12" />

      {/* Sección para visualizar el catálogo */}
      <section id="catalogo">
        <ProductList />
      </section>
    </main>
  );
}