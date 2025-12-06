import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("cloudAuth");
      const response = await axios.get(
        "https://cloudkitchenbackend-production.up.railway.app/api/getCatalog",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCatalog(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch catalog");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const token = localStorage.getItem("cloudAuth");
      await axios.delete(`https://cloudkitchenbackend-production.up.railway.app/api/deleteCatalog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item deleted successfully");
      fetchCatalog();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cloudAuth");
    navigate("/");
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📋 Cloud Kitchen Admin Dashboard</h1>
        <div className="flex gap-2">
  <button
    onClick={() => navigate("/create")}
    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm transition"
  >
    <Plus size={16} />
    Create Item
  </button>

  {/* NEW BUTTON → Go to Admin Orders Page */}
  <button
    onClick={() => navigate("/admin/orders")}
    className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm transition"
  >
    📦 Orders
  </button>

  <button
    onClick={handleLogout}
    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm transition"
  >
    <LogOut size={16} />
    Logout
  </button>
</div>

      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalog.map((item) => (
            <div
              key={item.ID}
              className="border rounded-lg p-4 shadow-sm flex flex-col gap-2 bg-white"
            >
              <div className="flex items-center gap-3">
                {item.ImageURL ? (
                  <img
                    src={item.ImageURL}
                    alt={item.Name}
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">{item.Name}</h2>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                    {item.Description}
                  </p>
                  <p className="text-emerald-600 font-bold">₹{item.Price}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => navigate(`/edit/${item.ID}`)}
                  className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 rounded transition"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.ID)}
                  className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white py-1 rounded transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
