import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Equipment() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/equipment").then(res => setItems(res.data));
  }, []);

  return (
    <Layout title="Equipment">
      <div className="grid grid-cols-2 gap-4">
        {items.map(eq => (
          <div
            key={eq.id}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <h3 className="font-semibold">{eq.name}</h3>
            <p className="text-sm text-gray-500">
              {eq.department} • {eq.location}
            </p>

            <button
              className="mt-3 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              onClick={() => api.get(`/equipment/${eq.id}/requests`)}
            >
              Maintenance
              <span className="bg-blue-600 text-white px-2 rounded-full text-xs">
                3
              </span>
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
