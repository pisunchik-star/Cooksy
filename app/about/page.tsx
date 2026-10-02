import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "О Cooksy — рецепты на любой вкус" };

export default function AboutPage() {
  return (
    <main className="page-shell min-h-screen">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link className="button button-quiet" href="/">
            На главную
          </Link>
        </div>
      </header>
      <article
        className="container"
        style={{ maxWidth: 760, padding: "76px 0 120px" }}
      >
        <span className="eyebrow">Готовим вместе</span>
        <h1
          style={{
            font: "600 48px var(--font-playfair),serif",
            margin: "12px 0 18px",
          }}
        >
          Cooksy — рецепты на любой вкус
        </h1>
        <p style={{ color: "#6e655d", fontSize: 18, lineHeight: 1.8 }}>
          Cooksy помогает каждый день находить идеи для завтрака, обеда и ужина.
          Здесь можно сохранять любимые блюда, делиться собственными находками и
          открывать кухню разных стран.
        </p>
        <h2
          id="rules"
          style={{ font: "600 28px var(--font-display),serif", marginTop: 46 }}
        >
          Правила публикации
        </h2>
        <ul style={{ color: "#6e655d", lineHeight: 2 }}>
          <li>
            Публикуйте собственные рецепты и фотографии или материалы, на
            которые у вас есть права.
          </li>
          <li>
            Указывайте понятные количества ингредиентов и последовательные шаги.
          </li>
          <li>
            Не размещайте опасные советы, рекламу, чужие тексты и изображения
            без разрешения.
          </li>
          <li>
            Будьте уважительны в комментариях. На сомнительный контент можно
            пожаловаться.
          </li>
        </ul>
        <Link className="button button-primary" href="/add">
          Поделиться рецептом
        </Link>
      </article>
    </main>
  );
}
