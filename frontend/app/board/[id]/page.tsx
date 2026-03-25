"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../shared/api";

export default function BoardPage() {
  const { id } = useParams(); // boardId

  const [columns, setColumns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any>({}); // { columnId: Task[] }
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchColumns();
    fetchMembers();
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

  const fetchMembers = async () => {
    const res = await api.get(`/boards/${id}/members`);
    setMembers(res.data);
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

  const updateTask = async (taskId: string, data: any) => {
    await api.patch(`/tasks/${taskId}`, data);
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
                  {/* верхняя строка */}
                  <div className="flex justify-between items-center">
                    <span>{task.title}</span>

                    <div className="flex gap-2">
                      {/* стрелка */}
                      <button
                        onClick={() =>
                          setExpandedTaskId(
                            expandedTaskId === task.id ? null : task.id,
                          )
                        }
                      >
                        ⬇️
                      </button>

                      {/* редактировать */}
                      <button onClick={() => editTask(task)}>✏️</button>

                      {/* удалить */}
                      <button onClick={() => deleteTask(task.id)}>🗑</button>
                    </div>
                  </div>

                  {/* раскрывающийся блок */}
                  {expandedTaskId === task.id && (
                    <div className="mt-2 flex flex-col gap-2 text-sm">
                      {/* описание */}
                      <textarea
                        value={task.description || ""}
                        onChange={(e) =>
                          updateTask(task.id, { description: e.target.value })
                        }
                        className="border p-1"
                        placeholder="Описание"
                      />

                      {/* исполнитель */}
                      <select
                        value={task.assigneeId || ""}
                        onChange={(e) =>
                          updateTask(task.id, { assigneeId: e.target.value })
                        }
                        className="border p-1"
                      >
                        <option value="">Без исполнителя</option>
                        {members.map((m: any) => (
                          <option key={m.user.id} value={m.user.id}>
                            {m.user.email}
                          </option>
                        ))}
                      </select>

                      {/* дедлайн */}
                      <input
                        type="date"
                        value={task.deadline ? task.deadline.slice(0, 10) : ""}
                        onChange={(e) =>
                          updateTask(task.id, { deadline: e.target.value })
                        }
                        className="border p-1"
                      />
                    </div>
                  )}
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
