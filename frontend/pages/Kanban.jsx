import AppLayout from "../components/AppLayout";
import { DndContext } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { api } from "../api";

const statuses = ["New","In Progress","Repaired","Scrap"];

export default function Kanban() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get("/requests").then(res => setTasks(res.data));
  }, []);

  const onDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const status = over.id;
    setTasks(tasks.map(t =>
      t.id === active.id ? { ...t, status } : t
    ));

    await api.put(`/requests/${active.id}/status`, { status });
  };

  return (
    <AppLayout>
      <DndContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4 p-6">
          {statuses.map(status => (
            <div
              key={status}
              id={status}
              className="bg-slate-200 dark:bg-slate-700 rounded-lg p-3"
            >
              <h3 className="font-semibold mb-2">{status}</h3>

              {tasks.filter(t => t.status === status).map(t => {
                const overdue =
                  t.scheduled_date &&
                  new Date(t.scheduled_date) < new Date() &&
                  t.status !== "Repaired";

                return (
                  <div
                    key={t.id}
                    id={t.id}
                    className={`bg-white dark:bg-slate-900 p-3 mb-3 rounded-lg shadow-sm border-l-4
                      ${status === "New" && "border-blue-500"}
                      ${status === "In Progress" && "border-yellow-500"}
                      ${status === "Repaired" && "border-green-500"}
                      ${status === "Scrap" && "border-red-500"}
                      ${overdue && "ring-2 ring-red-500 animate-pulse"}
                    `}
                  >
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-xs text-gray-500">
                      Equipment #{t.equipment_id}
                    </div>

                    <div className="flex justify-between mt-2">
                      <span className="text-xs bg-gray-100 dark:bg-slate-800 px-2 rounded">
                        {t.type}
                      </span>
                      {t.assigned_to && (
                        <img
                          src="https://i.pravatar.cc/24"
                          className="rounded-full"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </DndContext>
    </AppLayout>
  );
}
