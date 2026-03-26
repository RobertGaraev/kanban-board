"use client";

import { useState } from "react";
import { api } from "../../shared/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    setError("");

    try {
      await api.post("/auth/register", {
        email,
        password,
      });

      setSuccess(true);
    } catch (e: any) {
      if (e.response?.data?.message === "Пользователь уже существует") {
        setError("Пользователь с данным email уже зарегистрирован");
      } else {
        setError("Ошибка регистрации");
      }
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-4 w-80 mx-auto mt-20">
        <h1 className="text-xl font-bold text-green-600">
          Пользователь успешно зарегистрирован
        </h1>

        <button
          onClick={() => router.push("/login")}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-80 mx-auto mt-20">
      <h1 className="text-xl font-bold">Регистрация</h1>

      <input
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* ошибка под email */}
      {error && <span className="text-red-500 text-sm">{error}</span>}

      <input
        type="password"
        placeholder="Пароль"
        className="border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Зарегистрироваться
      </button>

      <button
        onClick={() => router.push("/login")}
        className="text-sm text-blue-500"
      >
        Уже есть аккаунт? Войти
      </button>
    </div>
  );
}
