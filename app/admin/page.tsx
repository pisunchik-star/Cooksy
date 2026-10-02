import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AdminPage() {
  return (
    <main className="page-shell min-h-screen">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <span className="text-sm text-[#817970]">Панель модерации</span>
        </div>
      </header>
      <section
        className="container"
        style={{ maxWidth: 900, padding: "50px 0 100px" }}
      >
        <h1 className="font-display text-4xl font-semibold">Жалобы</h1>
        <div className="mt-8 rounded-2xl border border-[#eee4dc] bg-white p-8 text-center">
          <p className="text-[#817970]">
            Для просмотра жалоб войдите в аккаунт администратора.
          </p>
          <Link className="button button-primary mt-4" href="/login">
            Войти
          </Link>
        </div>
      </section>
    </main>
  );
}
