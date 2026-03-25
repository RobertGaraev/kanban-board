"use client";

import { useEffect, useState } from "react";
import { api } from "../../shared/api";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get("/boards");
      setBoards(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const createBoard = async () => {
    const name = prompt("Название доски");

    if (!name) return;

    await api.post("/boards", {
      name,
      description: "",
    });

    fetchBoards();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Мои доски</h1>
      <button
        onClick={createBoard}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        + Создать доску
      </button>

      <div className="grid grid-cols-3 gap-4">
        {boards.map((board: any) => (
          <div
            key={board.id}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100"
          >
            <h2 className="font-semibold">{board.name}</h2>
            <p className="text-sm text-gray-500">
              {board.description || "Без описания"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
