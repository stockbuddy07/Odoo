import { useEffect, useState } from "react";
import { api } from "../api.js";

const statuses = ["New", "In Progress", "Repaired", "Scrap"];

export default function Kanban() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get("/requests").then(res => setTasks(res.data));
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      {statuses.map(status => (
        <div key={status} className="bg-slate-200 p-3 rounded">
          <h3 className="font-semibold mb-2">{status}</h3>
          {tasks
            .filter(t => t.status === status)
            .map(t => (
              <div
                key={t.id}
                className="bg-white p-3 mb-3 rounded shadow"
              >
                {t.subject}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
