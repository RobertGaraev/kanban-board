"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../shared/api";

const roleLabels: Record<string, string> = {
  OWNER: "Владелец",
  EDITOR: "Редактор",
  VIEWER: "Наблюдатель",
};

export default function BoardPage() {
  const { id } = useParams();
  const router = useRouter();

  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any>({});
  const [members, setMembers] = useState<any[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [membersModal, setMembersModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "delete">("add");

  const [email, setEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("EDITOR");

  useEffect(() => {
    fetchBoard();
    fetchColumns();
    fetchMembers();
  }, []);

  const getUserId = () => {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token!.split(".")[1]));
    return payload.userId;
  };

  const getRole = () => {
    if (!board) return "VIEWER";
    if (board.ownerId === getUserId()) return "OWNER";
    return board.members?.[0]?.role || "VIEWER";
  };

  const fetchBoard = async () => {
    const res = await api.get(`/boards/${id}`);
    setBoard(res.data);
  };

  const fetchColumns = async () => {
    const res = await api.get(`/columns/board/${id}`);
    setColumns(res.data);

    const map: any = {};
    for (const col of res.data) {
      const t = await api.get(`/tasks/column/${col.id}`);
      map[col.id] = t.data;
    }
    setTasks(map);
  };

  const fetchMembers = async () => {
    const res = await api.get(`/boards/${id}/members`);
    setMembers(res.data);
  };

  // 🔒 доступ
  const canEdit = getRole() !== "VIEWER";
  const isOwner = getRole() === "OWNER";

  // ---------------- КОЛОНКИ ----------------
  const createColumn = async () => {
    const name = prompt("Название");
    if (!name) return;

    await api.post("/columns", { name, boardId: id });
    fetchColumns();
  };

  const renameColumn = async (id: string) => {
    const name = prompt("Новое название");
    if (!name) return;

    await api.patch(`/columns/${id}`, { name });
    fetchColumns();
  };

  const deleteColumn = async (id: string) => {
    if (!confirm("Удалить?")) return;

    await api.delete(`/columns/${id}`);
    fetchColumns();
  };

  // ---------------- ЗАДАЧИ ----------------
  const createTask = async (columnId: string) => {
    const title = prompt("Название");
    if (!title) return;

    await api.post("/tasks", { title, columnId });
    fetchColumns();
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Удалить задачу?")) return;

    await api.delete(`/tasks/${taskId}`);
    fetchColumns();
  };

  const updateTask = async (taskId: string, data: any) => {
    await api.patch(`/tasks/${taskId}`, data);
    fetchColumns();
  };

  // ---------------- УЧАСТНИКИ ----------------
  const handleAdd = async () => {
    try {
      await api.post(`/boards/${id}/invite`, { email, role });
      fetchMembers();
      alert("Участник успешно добавлен");
    } catch (e: any) {
      const message = e.response?.data?.message;

      if (message === "User not found") {
        alert("Участник с данным email не найден");
      } else if (message === "User already in board") {
        alert("Участник уже добавлен");
      } else {
        alert("Ошибка");
      }
    }
  };

  const handleUpdateRole = async () => {
    try {
      await api.patch(`/boards/${id}/member`, {
        userId: selectedUserId,
        role,
      });
      fetchMembers();
      alert("Роль успешно применена");
    } catch {
      alert("Владелец не может иметь другой роли");
    }
  };

  const handleDeleteMember = async () => {
    await api.delete(`/boards/${id}/member/${selectedUserId}`);
    fetchMembers();
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{board?.name}</h1>

        <div className="flex gap-2">
          {isOwner && (
            <button
              onClick={() => setMembersModal(true)}
              className="border px-3 py-1 rounded"
            >
              Участники
            </button>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            className="border px-3 py-1 rounded"
          >
            Назад
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Ваша роль: {roleLabels[getRole()]}
      </p>

      {/* КОЛОНКИ */}
      <div className="flex gap-4 overflow-x-auto">
        {columns.map((col) => (
          <div key={col.id} className="w-64 bg-gray-100 p-3 rounded">
            <div className="flex justify-between">
              <h2>{col.name}</h2>

              {isOwner && (
                <div className="flex gap-2">
                  <button onClick={() => renameColumn(col.id)}>✏️</button>
                  <button onClick={() => deleteColumn(col.id)}>🗑</button>
                </div>
              )}
            </div>

            {/* задачи */}
            <div className="flex flex-col gap-2 mt-2">
              {(tasks[col.id] || []).map((task: any) => (
                <div key={task.id} className="bg-white p-2 rounded shadow">
                  <div className="flex justify-between">
                    <span>{task.title}</span>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExpandedTaskId(
                            expandedTaskId === task.id ? null : task.id,
                          )
                        }
                      >
                        ⬇️
                      </button>

                      {canEdit && (
                        <>
                          <button onClick={() => deleteTask(task.id)}>
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {expandedTaskId === task.id && (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        disabled={!canEdit}
                        value={task.description || ""}
                        onChange={(e) =>
                          updateTask(task.id, { description: e.target.value })
                        }
                        className="border p-1"
                      />

                      <select
                        disabled={!canEdit}
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

                      <input
                        type="date"
                        disabled={!canEdit}
                        value={task.deadline?.slice(0, 10) || ""}
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

            {canEdit && (
              <button
                onClick={() => createTask(col.id)}
                className="mt-2 text-blue-500 text-sm"
              >
                + Задача
              </button>
            )}
          </div>
        ))}

        {canEdit && (
          <button
            onClick={createColumn}
            className="w-64 h-12 bg-gray-200 rounded"
          >
            + Колонка
          </button>
        )}
      </div>

      {/* МОДАЛКА УЧАСТНИКОВ */}
      {membersModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96 flex flex-col gap-3">
            <h2 className="font-bold">Участники</h2>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setMode("add")}
                className="border p-2 rounded"
              >
                Добавить участника
              </button>

              <button
                onClick={() => setMode("edit")}
                className="border p-2 rounded"
              >
                Изменить роль участника
              </button>

              <button
                onClick={() => setMode("delete")}
                className="border p-2 rounded"
              >
                Удалить участника
              </button>
            </div>

            {mode === "add" && (
              <>
                <input
                  placeholder="Email"
                  className="border p-2"
                  onChange={(e) => setEmail(e.target.value)}
                />

                <select
                  onChange={(e) => setRole(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="EDITOR">Редактор</option>
                  <option value="VIEWER">Наблюдатель</option>
                </select>

                <button onClick={handleAdd} className="border p-2 rounded">
                  Добавить
                </button>
              </>
            )}

            {(mode === "edit" || mode === "delete") && (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="border p-2"
              >
                {members
                  .filter((m: any) => m.user.id !== board.ownerId)
                  .map((m: any) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.email}
                    </option>
                  ))}
              </select>
            )}

            {mode === "edit" && (
              <>
                <select
                  onChange={(e) => setRole(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="EDITOR">Редактор</option>
                  <option value="VIEWER">Наблюдатель</option>
                </select>

                <button
                  onClick={handleUpdateRole}
                  className="border p-2 rounded"
                >
                  Изменить
                </button>
              </>
            )}

            {mode === "delete" && (
              <button
                onClick={handleDeleteMember}
                className="border p-2 rounded"
              >
                Удалить
              </button>
            )}

            <button
              onClick={() => setMembersModal(false)}
              className="border p-2 rounded"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
