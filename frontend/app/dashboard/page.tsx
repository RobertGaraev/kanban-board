"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../shared/api";
import { CreateBoardModal } from "../../components/CreateBoardModal";

export default function Dashboard() {
  const [boards, setBoards] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get("/boards");
      setBoards(res.data);
    } catch (e) {
      console.error("Ошибка загрузки досок", e);
    }
  };

  const openBoard = (id: string) => {
    router.push(`/board/${id}`);
  };

  return (
    <div className="p-6">
      {/* Заголовок */}
      <h1 className="text-2xl font-bold mb-4">Мои доски</h1>

      {/* Кнопка создания */}
      <button
        onClick={() => setIsOpen(true)}
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded"
      >
        + Создать доску
      </button>

      {/* Список досок */}
      <div className="grid grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => openBoard(board.id)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100 transition"
          >
            <h2 className="font-semibold text-lg">{board.name}</h2>

            <p className="text-sm text-gray-500 mt-1">
              {board.description || "Без описания"}
            </p>
          </div>
        ))}
      </div>

      {/* Модалка */}
      {isOpen && (
        <CreateBoardModal
          onClose={() => setIsOpen(false)}
          onCreated={fetchBoards}
        />
      )}
    </div>
  );
}
