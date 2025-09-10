// /app/page.tsx
import ProductList from './components/ProductList';
import OrderForm from './components/OrderForm';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800">
          Sistema de Gestión
        </h1>
      </header>
      
      {/* Sección para crear nuevos pedidos */}
      <section id="crear-pedido" className="mb-12">
        <OrderForm />
      </section>

      <hr className="my-8 sm:my-12" />

      {/* Sección para visualizar el catálogo */}
      <section id="catalogo">
        <ProductList />
      </section>
    </main>
  );
}
