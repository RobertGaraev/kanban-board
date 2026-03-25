"use client";

import { useState } from "react";
import { api } from "../shared/api";
import { useRouter } from "next/navigation";

export const AuthForm = ({ type }: { type: "login" | "register" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const url = type === "login" ? "/auth/login" : "/auth/register";

      const res = await api.post(url, { email, password });

      // сохраняем токен
      localStorage.setItem("token", res.data.access_token);

      router.push("/dashboard");
    } catch (e: any) {
      alert(e.response?.data?.message || "Ошибка");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-80 mx-auto mt-20">
      <h1 className="text-xl font-bold">
        {type === "login" ? "Вход" : "Регистрация"}
      </h1>

      <input
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {type === "login" ? "Войти" : "Зарегистрироваться"}
      </button>
    </div>
  );
};
