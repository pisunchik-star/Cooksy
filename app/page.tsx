import { ArrowRight, Clock3, Flame, Heart, Search, Star } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteHeader } from "@/components/SiteHeader";

const categories = [
  ["☀", "Завтраки", "завтраки"],
  ["♨", "Супы", "супы"],
  ["◈", "Горячее", "горячее"],
  ["✿", "Салаты", "салаты"],
  ["⌂", "Выпечка", "выпечка"],
  ["♡", "Десерты", "десерты"],
  ["✳", "Вегетарианское", "вегетарианское"],
];

const recipes = [
  {
    id: "creamy-pasta",
    name: "Паста с нежным сливочным соусом",
    time: "20 мин",
    rating: "4.9",
    source: "Выбор редакции",
    image: "photo-1473093295043-cdd812d0e601",
  },
  {
    id: "avocado-toast",
    name: "Тост с авокадо и яйцом пашот",
    time: "15 мин",
    rating: "4.8",
    source: "От пользователя",
    image: "photo-1525351484163-7529414344d8",
  },
  {
    id: "tomato-soup",
    name: "Томатный суп с базиликом",
    time: "30 мин",
    rating: "4.9",
    source: "Из каталога",
    image: "photo-1547592180-85f173990554",
  },
  {
    id: "berry-pancakes",
    name: "Пышные панкейки с ягодами",
    time: "25 мин",
    rating: "5.0",
    source: "От пользователя",
    image: "photo-1528207776546-365bb710ee93",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="hero container">
        <span className="eyebrow">
          <Flame size={15} fill="currentColor" /> Вдохновение на каждый день
        </span>
        <h1>
          Что приготовим
          <br />
          сегодня?
        </h1>
        <p>Тысячи рецептов, которые хочется попробовать</p>
        <form action="/search" className="search-box">
          <Search size={21} aria-hidden="true" />
          <input
            name="q"
            placeholder="Например, паста, борщ или тирамису"
            aria-label="Найти рецепт"
          />
          <button className="button button-primary" type="submit">
            Найти <ArrowRight size={16} />
          </button>
        </form>
        <p className="hero-note">
          Попробуйте: сырники · крем-суп · шоколадный торт
        </p>
      </section>

      <section className="container section" aria-label="Категории рецептов">
        <div className="section-heading">
          <h2>Выбирайте по настроению</h2>
        </div>
        <div className="category-grid">
          {categories.map(([icon, name, query]) => (
            <Link
              className="category"
              href={`/search?q=${encodeURIComponent(query)}`}
              key={name}
            >
              <span className="category-icon">{icon}</span>
              <span>{name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section" id="popular">
        <div className="section-heading">
          <div>
            <span className="eyebrow">На каждый день</span>
            <h2 style={{ marginTop: 8 }}>Популярное сейчас</h2>
          </div>
          <Link href="/search?q=популярное">
            Все рецепты{" "}
            <ArrowRight size={14} style={{ verticalAlign: "middle" }} />
          </Link>
        </div>
        <div className="recipe-grid">
          {recipes.map((recipe, index) => (
            <Link
              className="recipe-card"
              href={`/recipe/${recipe.id}`}
              key={recipe.id}
            >
              <div className="recipe-image">
                <img
                  src={`https://images.unsplash.com/${recipe.image}?auto=format&fit=crop&w=720&q=82`}
                  alt={recipe.name}
                  loading={index > 1 ? "lazy" : "eager"}
                />
                <span className="recipe-badge">{recipe.source}</span>
                <button
                  type="button"
                  aria-label="В избранное"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#F55220]"
                  onClick={(event) => event.preventDefault()}
                >
                  <Heart size={16} />
                </button>
              </div>
              <div className="recipe-body">
                <h3>{recipe.name}</h3>
                <div className="recipe-meta">
                  <span>
                    <Clock3 size={13} />
                    {recipe.time}
                  </span>
                  <span>
                    <Star size={13} fill="#F5A623" color="#F5A623" />
                    {recipe.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 46 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Маленькое большое удовольствие</span>
            <h2 style={{ marginTop: 8 }}>Быстро за 15 минут</h2>
          </div>
          <Link href="/search?time=15">
            Подборка{" "}
            <ArrowRight size={14} style={{ verticalAlign: "middle" }} />
          </Link>
        </div>
        <p style={{ color: "#817970", fontSize: 14 }}>
          Простые идеи, когда хочется вкусно и без долгих хлопот.
        </p>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <span>Cooksy — рецепты на любой вкус</span>
          <div className="footer-links">
            <Link href="/about">О проекте</Link>
            <Link href="/about#rules">Правила публикации</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
