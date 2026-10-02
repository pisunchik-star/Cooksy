import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Link href="/">
        <Logo size="lg" />
      </Link>
      <p className="mt-10 text-sm font-bold uppercase tracking-widest text-[#F55220]">
        404
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold">
        Кажется, этот рецепт потерялся
      </h1>
      <p className="mt-3 max-w-md text-[#817970]">
        Такой страницы нет. Вернитесь на главную и найдите что-нибудь вкусное.
      </p>
      <Link href="/" className="button button-primary mt-7">
        На главную
      </Link>
    </main>
  );
}
