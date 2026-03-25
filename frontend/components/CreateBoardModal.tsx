"use client";

import { useState } from "react";
import { api } from "../shared/api";

export const CreateBoardModal = ({ onClose, onCreated }: any) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Название обязательно");
      return;
    }

    await api.post("/boards", {
      name,
      description, // ✅ отправляем
    });

    onCreated(); // обновить список
    onClose(); // закрыть модалку
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 flex flex-col gap-3">
        <h2 className="text-lg font-bold">Создать доску</h2>

        <input
          placeholder="Название *"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Описание (необязательно)"
          className="border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Отмена</button>

          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};
