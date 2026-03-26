"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../shared/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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

  const [descriptions, setDescriptions] = useState<any>({});
  const availableMembers = members.filter(
    (m: any) => m.user.id !== board?.ownerId,
  );

  useEffect(() => {
    fetchBoard();
    fetchColumns();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!board) return; // защита

    const availableMembers = members.filter(
      (m: any) => m.user.id !== board.ownerId,
    );

    if (availableMembers.length === 1) {
      setSelectedUserId(availableMembers[0].user.id);
    }
  }, [members, board]);

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
    const descMap: any = {};

    for (const col of res.data) {
      const t = await api.get(`/tasks/column/${col.id}`);
      map[col.id] = t.data;

      t.data.forEach((task: any) => {
        descMap[task.id] = task.description || "";
      });
    }

    setTasks(map);
    setDescriptions(descMap);
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

  const onDragEnd = async (result: any) => {
    if (!canEdit) return; // 🔒 запрет для VIEWER

    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    if (sourceColId === destColId && source.index === destination.index) return;

    // копируем массив задач из исходной колонки
    const sourceTasks = Array.from(tasks[sourceColId]);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (!movedTask) return;

    // создаем копию задачи для TS
    const movedTaskCopy = { ...movedTask };

    if (sourceColId === destColId) {
      sourceTasks.splice(destination.index, 0, movedTaskCopy);

      setTasks({
        ...tasks,
        [sourceColId]: sourceTasks,
      });
    } else {
      const destTasks = Array.from(tasks[destColId] || []);
      destTasks.splice(destination.index, 0, movedTaskCopy);

      setTasks({
        ...tasks,
        [sourceColId]: sourceTasks,
        [destColId]: destTasks,
      });
    }

    // уведомляем сервер о перемещении задачи
    await api.patch(`/tasks/${draggableId}/move`, {
      columnId: destColId,
      order: destination.index,
    });
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

      {/* 🔥 DRAG & DROP */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          {columns.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-64 bg-gray-100 p-3 rounded"
                >
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
                    {(tasks[col.id] || []).map((task: any, index: number) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                        isDragDisabled={!canEdit} // 🔒 запрет для VIEWER
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 rounded shadow"
                          >
                            <div className="flex justify-between">
                              <span>{task.title}</span>

                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setExpandedTaskId(
                                      expandedTaskId === task.id
                                        ? null
                                        : task.id,
                                    )
                                  }
                                >
                                  ⬇️
                                </button>

                                {canEdit && (
                                  <button onClick={() => deleteTask(task.id)}>
                                    🗑
                                  </button>
                                )}
                              </div>
                            </div>

                            {expandedTaskId === task.id && (
                              <div className="mt-2 flex flex-col gap-2">
                                <textarea
                                  disabled={!canEdit}
                                  value={descriptions[task.id] || ""}
                                  onChange={(e) =>
                                    setDescriptions({
                                      ...descriptions,
                                      [task.id]: e.target.value,
                                    })
                                  }
                                  onBlur={() =>
                                    updateTask(task.id, {
                                      description: descriptions[task.id],
                                    })
                                  }
                                  className="border p-1"
                                />

                                <select
                                  disabled={!canEdit}
                                  value={task.assigneeId || ""}
                                  onChange={(e) =>
                                    updateTask(task.id, {
                                      assigneeId: e.target.value || null,
                                    })
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
                                    updateTask(task.id, {
                                      deadline: e.target.value,
                                    })
                                  }
                                  className="border p-1"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {/* 🔥 ОБЯЗАТЕЛЬНО */}
                    {provided.placeholder}
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
              )}
            </Droppable>
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
      </DragDropContext>

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
            {(mode === "edit" || mode === "delete") &&
              (() => {
                const availableMembers = members.filter(
                  (m: any) => m.user.id !== board?.ownerId,
                );

                // ❌ нет участников
                if (availableMembers.length === 0) {
                  return (
                    <div className="text-gray-500">
                      Нет участников для управления
                    </div>
                  );
                }

                return (
                  <>
                    {/* 👤 выбор участника */}
                    {availableMembers.length === 1 ? (
                      <div className="border p-2 rounded">
                        {availableMembers[0].user.email}
                      </div>
                    ) : (
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="border p-2 rounded"
                      >
                        <option value="">Выберите участника</option>
                        {availableMembers.map((m: any) => (
                          <option key={m.user.id} value={m.user.id}>
                            {m.user.email}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* ✏️ изменение роли */}
                    {mode === "edit" && (
                      <>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="border p-2 rounded"
                        >
                          <option value="EDITOR">Редактор</option>
                          <option value="VIEWER">Наблюдатель</option>
                        </select>

                        <button
                          onClick={handleUpdateRole}
                          disabled={!selectedUserId}
                          className="border p-2 rounded"
                        >
                          Изменить
                        </button>
                      </>
                    )}

                    {/* 🗑 удаление */}
                    {mode === "delete" && (
                      <button
                        onClick={handleDeleteMember}
                        disabled={!selectedUserId}
                        className="border p-2 rounded"
                      >
                        Удалить
                      </button>
                    )}
                  </>
                );
              })()}

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
