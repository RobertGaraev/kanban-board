"use client";

import { useEffect, useState } from "react";
import { api } from "../../shared/api";
import { useRouter } from "next/navigation";

const roleLabels: Record<string, string> = {
  OWNER: "Владелец",
  EDITOR: "Редактор",
  VIEWER: "Наблюдатель",
};

export default function DashboardPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingBoard, setEditingBoard] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    const res = await api.get("/boards");
    setBoards(res.data);
  };

  const getRole = (board: any) => {
    const token = localStorage.getItem("token");
    if (!token) return "VIEWER";

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.userId;

    if (board.ownerId === userId) return "OWNER";

    return board.members?.[0]?.role || "VIEWER";
  };

  // 🚪 logout
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ➕ открыть создание
  const openCreate = () => {
    setEditingBoard(null);
    setName("");
    setDescription("");
    setIsOpen(true);
  };

  // ✏️ открыть редактирование
  const openEdit = (board: any) => {
    setEditingBoard(board);
    setName(board.name);
    setDescription(board.description || "");
    setIsOpen(true);
  };

  // 💾 submit (универсальный)
  const handleSubmit = async () => {
    if (!name.trim()) return;

    if (editingBoard) {
      await api.patch(`/boards/${editingBoard.id}`, {
        name,
        description,
      });
    } else {
      await api.post("/boards", {
        name,
        description,
      });
    }

    setIsOpen(false);
    fetchBoards();
  };

  // 🗑 удалить
  const deleteBoard = async (id: string) => {
    if (!confirm("Удалить доску?")) return;

    await api.delete(`/boards/${id}`);
    fetchBoards();
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои доски</h1>

        <button
          onClick={logout}
          className="border border-black px-4 py-1 rounded"
        >
          Выйти
        </button>
      </div>

      {/* список досок */}
      <div className="flex flex-wrap gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="w-64 bg-gray-100 p-4 rounded flex flex-col gap-2"
          >
            <h2 className="font-semibold">{board.name}</h2>

            <p className="text-sm text-gray-600">{board.description}</p>
            <p className="text-xs text-gray-500">
              Роль: {roleLabels[getRole(board)]}
            </p>

            {getRole(board) === "OWNER" && (
              <div className="flex gap-2">
                <button onClick={() => openEdit(board)}>✏️</button>
                <button onClick={() => deleteBoard(board.id)}>🗑</button>
              </div>
            )}

            <button
              onClick={() => router.push(`/board/${board.id}`)}
              className="mt-2 text-blue-500 text-sm"
            >
              Открыть
            </button>
          </div>
        ))}

        {/* добавить */}
        <button onClick={openCreate} className="w-64 h-32 bg-gray-200 rounded">
          + Создать доску
        </button>
      </div>

      {/* МОДАЛКА */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-80 flex flex-col gap-3">
            <h2 className="text-lg font-bold">
              {editingBoard ? "Редактировать доску" : "Создать доску"}
            </h2>

            <input
              placeholder="Название"
              className="border p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              placeholder="Описание"
              className="border p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="border border-black p-2 rounded flex-1"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white p-2 rounded flex-1"
              >
                {editingBoard ? "Редактировать" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
