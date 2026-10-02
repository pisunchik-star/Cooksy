import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function ProfilePage() {
  return (
    <main className="page-shell min-h-screen">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link href="/add" className="button button-primary">
            Добавить рецепт
          </Link>
        </div>
      </header>
      <section
        className="container"
        style={{ maxWidth: 850, padding: "56px 0 100px" }}
      >
        <span className="eyebrow">Ваш Cooksy</span>
        <h1
          style={{
            font: "600 42px var(--font-playfair),serif",
            margin: "8px 0 28px",
          }}
        >
          Личный кабинет
        </h1>
        <div className="flex gap-7 border-b border-[#eee4dc] pb-3 text-sm">
          <a href="#my-recipes" className="font-semibold text-[#F55220]">
            Мои рецепты
          </a>
          <a href="#favorites">Избранное</a>
        </div>
        <div id="my-recipes" className="py-12 text-center">
          <h2 className="font-display text-2xl font-semibold">
            Войдите в свой аккаунт
          </h2>
          <p className="my-3 text-sm text-[#817970]">
            После входа здесь появятся ваши рецепты и сохранённые блюда.
          </p>
          <Link className="button button-primary" href="/login">
            Войти
          </Link>
        </div>
        <div id="favorites" />
      </section>
    </main>
  );
}
