import { useState } from 'react';
import { addMenuItem } from '../utils/api';

function CatalogForm() {
  const [item, setItem] = useState({ name: '', price: '', description: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMenuItem(item);
      setItem({ name: '', price: '', description: '' });
    } catch (err) {
      setError('Failed to add item');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Add Menu Item</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        <input
          type="text"
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          placeholder="Item Name"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="number"
          value={item.price}
          onChange={(e) => setItem({ ...item, price: e.target.value })}
          placeholder="Price"
          className="w-full p-2 mb-4 border rounded"
        />
        <textarea
          value={item.description}
          onChange={(e) => setItem({ ...item, description: e.target.value })}
          placeholder="Description"
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Add Item
        </button>
      </div>
    </div>
  );
}

export default CatalogForm;