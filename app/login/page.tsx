import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#eee8e1] bg-white p-8 shadow-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo size="md" />
        </Link>
        <h1 className="text-center font-display text-3xl font-semibold">
          С возвращением
        </h1>
        <p className="mb-7 mt-2 text-center text-sm text-[#817970]">
          Войдите, чтобы сохранять любимые рецепты
        </p>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-[#817970]">
          Впервые здесь?{" "}
          <Link href="/register" className="font-semibold text-[#F55220]">
            Создать аккаунт
          </Link>
        </p>
      </div>
    </main>
  );
}
