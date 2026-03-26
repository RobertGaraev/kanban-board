"use client";

import { useState } from "react";
import { api } from "../shared/api";
import { useRouter } from "next/navigation";

export const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async () => {
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);

      router.push("/dashboard");
    } catch (e: any) {
      setError("Email или пароль введены неверно");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-80 mx-auto mt-20">
      <h1 className="text-xl font-bold">Вход</h1>

      <input
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Пароль"
        className="border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* ошибка */}
      {error && <span className="text-red-500 text-sm">{error}</span>}

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Войти
      </button>

      {/* переход на регистрацию */}
      <button
        onClick={() => router.push("/register")}
        className="text-sm text-blue-500"
      >
        Нет аккаунта? Зарегистрироваться
      </button>
    </div>
  );
};
