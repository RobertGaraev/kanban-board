"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../shared/api";

export default function BoardPage() {
  const { id } = useParams(); // boardId

  const [columns, setColumns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any>({}); // { columnId: Task[] }

  useEffect(() => {
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    const res = await api.get(`/columns/board/${id}`);
    setColumns(res.data);

    // загрузим задачи для каждой колонки
    const tasksMap: any = {};

    for (const col of res.data) {
      const tasksRes = await api.get(`/tasks/column/${col.id}`);
      tasksMap[col.id] = tasksRes.data;
    }

    setTasks(tasksMap);
  };

  // ➕ создать колонку
  const createColumn = async () => {
    const name = prompt("Название колонки");
    if (!name) return;

    await api.post("/columns", {
      name,
      boardId: id,
    });

    fetchColumns();
  };

  //переименование колонки
  const renameColumn = async (colId: string) => {
    const name = prompt("Новое название колонки");
    if (!name?.trim()) return;

    await api.patch(`/columns/${colId}`, { name });
    fetchColumns();
  };

  //удаление колонки
  const deleteColumn = async (colId: string) => {
    if (!confirm("Удалить колонку?")) return;

    await api.delete(`/columns/${colId}`);
    fetchColumns();
  };

  // ➕ создать задачу
  const createTask = async (columnId: string) => {
    const title = prompt("Название задачи");
    if (!title) return;

    await api.post("/tasks", {
      title,
      columnId,
    });

    fetchColumns();
  };

  //изменить задачу
  const editTask = async (task: any) => {
    const title = prompt("Название", task.title);
    if (!title?.trim()) return;

    const description = prompt("Описание", task.description || "");

    await api.patch(`/tasks/${task.id}`, {
      title,
      description,
    });

    fetchColumns();
  };

  //удалить задачу
  const deleteTask = async (taskId: string) => {
    if (!confirm("Удалить задачу?")) return;

    await api.delete(`/tasks/${taskId}`);
    fetchColumns();
  };

  return (
    <div className="p-6 overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">Доска</h1>

      <div className="flex gap-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className="w-64 bg-gray-100 p-3 rounded flex flex-col"
          >
            <h2 className="font-semibold mb-2">{col.name}</h2>
            <div className="flex gap-2">
              <button onClick={() => renameColumn(col.id)}>✏️</button>
              <button onClick={() => deleteColumn(col.id)}>🗑</button>
            </div>

            {/* задачи */}
            <div className="flex flex-col gap-2">
              {(tasks[col.id] || []).map((task: any) => (
                <div key={task.id} className="bg-white p-2 rounded shadow">
                  {task.title}
                </div>
              ))}
            </div>

            {/* добавить задачу */}
            <button
              onClick={() => createTask(col.id)}
              className="mt-2 text-sm text-blue-500"
            >
              + Добавить задачу
            </button>
          </div>
        ))}

        {/* добавить колонку */}
        <button
          onClick={createColumn}
          className="w-64 h-12 bg-gray-200 rounded"
        >
          + Добавить колонку
        </button>
      </div>
    </div>
  );
}
