import CatalogForm from '../components/CatalogForm.jsx';
import OrderForm from '../components/OrderForm.jsx';

function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Cloud Kitchen Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CatalogForm />
        <OrderForm />
      </div>
    </div>
  );
}

export default DashboardPage;