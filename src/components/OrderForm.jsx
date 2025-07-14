import { useState } from 'react';
import { createOrder } from '../utils/api';

function OrderForm() {
  const [order, setOrder] = useState({ itemId: '', quantity: '', customerName: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder(order);
      setOrder({ itemId: '', quantity: '', customerName: '' });
    } catch (err) {
      setError('Failed to create order');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create Order</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        <input
          type="text"
          value={order.itemId}
          onChange={(e) => setOrder({ ...order, itemId: e.target.value })}
          placeholder="Item ID"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="number"
          value={order.quantity}
          onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
          placeholder="Quantity"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          value={order.customerName}
          onChange={(e) => setOrder({ ...order, customerName: e.target.value })}
          placeholder="Customer Name"
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Order
        </button>
      </div>
    </div>
  );
}

export default OrderForm;