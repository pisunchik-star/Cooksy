"use client";

import { ArrowLeft, Clock3, Search, Star } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import type { Recipe } from "@/lib/recipe";

function SearchResults() {
  const params = useSearchParams();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(Boolean(initial));
  const [filters, setFilters] = useState({
    category: "",
    maxMinutes: "",
    difficulty: "",
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        setResults(data.recipes || []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState({}, "", url);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setResults(data.recipes || []);
    } finally {
      setLoading(false);
    }
  }

  const visible = results.filter(
    (recipe) =>
      (!filters.maxMinutes || recipe.minutes <= Number(filters.maxMinutes)) &&
      (!filters.category ||
        `${recipe.title} ${recipe.description}`
          .toLocaleLowerCase("ru")
          .includes(filters.category.toLocaleLowerCase("ru"))),
  );
  return (
    <main className="page-shell min-h-screen">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link className="button button-quiet" href="/">
            <ArrowLeft size={16} /> На главную
          </Link>
        </div>
      </header>
      <section
        className="container"
        style={{ paddingTop: 48, paddingBottom: 80 }}
      >
        <span className="eyebrow">Вдохновение рядом</span>
        <h1
          style={{
            font: "600 38px var(--font-playfair),serif",
            margin: "10px 0 22px",
          }}
        >
          Найдите свой рецепт
        </h1>
        <form className="search-box" onSubmit={submit}>
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Что хочется приготовить?"
            aria-label="Поиск рецептов"
          />
          <button className="button button-primary" type="submit">
            Найти
          </button>
        </form>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            margin: "18px 0 32px",
          }}
        >
          <select
            aria-label="Категория"
            className="button button-quiet"
            value={filters.category}
            onChange={(event) =>
              setFilters({ ...filters, category: event.target.value })
            }
          >
            <option value="">Все категории</option>
            {["завтрак", "суп", "салат", "десерт", "паста"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            aria-label="Время приготовления"
            className="button button-quiet"
            value={filters.maxMinutes}
            onChange={(event) =>
              setFilters({ ...filters, maxMinutes: event.target.value })
            }
          >
            <option value="">Любое время</option>
            <option value="15">До 15 минут</option>
            <option value="30">До 30 минут</option>
            <option value="60">До часа</option>
          </select>
          <select
            aria-label="Сложность"
            className="button button-quiet"
            value={filters.difficulty}
            onChange={(event) =>
              setFilters({ ...filters, difficulty: event.target.value })
            }
          >
            <option value="">Любая сложность</option>
            <option>Легко</option>
            <option>Средне</option>
            <option>Сложно</option>
          </select>
        </div>
        <p style={{ color: "#817970", fontSize: 14 }}>
          {loading
            ? "Ищем рецепты…"
            : `${visible.length} рецептов по запросу «${query}»`}
        </p>
        {loading ? (
          <div className="recipe-grid">
            {[1, 2, 3, 4].map((key) => (
              <div key={key} className="recipe-card animate-pulse">
                <div className="recipe-image" />
                <div className="recipe-body">
                  <div className="h-4 rounded bg-[#f4eee8]" />
                  <div className="mt-4 h-3 w-2/3 rounded bg-[#f4eee8]" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length ? (
          <div className="recipe-grid">
            {visible.map((recipe) => (
              <Link
                className="recipe-card"
                key={recipe.id}
                href={`/recipe/${recipe.id}`}
              >
                <div className="recipe-image">
                  {recipe.image && (
                    <img src={recipe.image} alt={recipe.title} loading="lazy" />
                  )}
                  <span className="recipe-badge">
                    {recipe.source === "user"
                      ? "От пользователя"
                      : recipe.source === "ai"
                        ? "Рецепт создан ИИ"
                        : "Из каталога"}
                  </span>
                </div>
                <div className="recipe-body">
                  <h3>{recipe.title}</h3>
                  <div className="recipe-meta">
                    <span>
                      <Clock3 size={13} />
                      {recipe.minutes} мин
                    </span>
                    <span>
                      <Star size={13} fill="#F5A623" color="#F5A623" />
                      {recipe.rating || "Новый"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "64px 20px",
              textAlign: "center",
              borderRadius: 24,
              background: "white",
            }}
          >
            <div style={{ fontSize: 42 }}>🍲</div>
            <h2 style={{ font: "600 24px var(--font-playfair),serif" }}>
              Пока ничего не нашлось
            </h2>
            <p style={{ color: "#817970" }}>
              Попробуйте изменить запрос или загляните в популярные рецепты.
            </p>
            <Link className="button button-primary" href="/">
              На главную
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="page-shell min-h-screen" />}>
      <SearchResults />
    </Suspense>
  );
}
