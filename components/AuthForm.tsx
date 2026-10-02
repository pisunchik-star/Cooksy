"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const name = String(form.get("name") || "");
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError(
        "Сначала добавьте URL и anon key проекта Supabase в .env.local.",
      );
      setBusy(false);
      return;
    }
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
          });
    if (result.error) setError(result.error.message);
    else
      window.location.assign(
        mode === "register" && !result.data.session
          ? "/login?check-email=1"
          : "/profile",
      );
    setBusy(false);
  }
  async function google() {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError("Сначала добавьте параметры Supabase в .env.local.");
      return;
    }
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) setError(authError.message);
  }
  return (
    <>
      <form className="space-y-4" onSubmit={submit}>
        {mode === "register" && (
          <label className="block text-sm font-semibold">
            Имя
            <input
              name="name"
              required
              maxLength={80}
              className="mt-2 block w-full rounded-2xl border border-[#eee4dc] p-3 font-normal"
            />
          </label>
        )}
        <label className="block text-sm font-semibold">
          Электронная почта
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            className="mt-2 block w-full rounded-2xl border border-[#eee4dc] p-3 font-normal"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm font-semibold">
          Пароль
          <input
            name="password"
            required
            minLength={8}
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className="mt-2 block w-full rounded-2xl border border-[#eee4dc] p-3 font-normal"
            placeholder="Не менее 8 символов"
          />
        </label>
        <button
          disabled={busy}
          type="submit"
          className="button button-primary w-full"
        >
          {busy
            ? "Подождите…"
            : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
        </button>
      </form>
      <button
        type="button"
        className="button button-quiet mt-3 w-full"
        onClick={google}
      >
        Продолжить с Google
      </button>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
