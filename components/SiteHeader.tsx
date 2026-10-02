"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("cooksy-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("cooksy-theme", next ? "dark" : "light");
  }
  return (
    <header className="topbar print:hidden">
      <div className="container topbar-inner">
        <Link href="/" aria-label="Cooksy — главная">
          <Logo size="sm" />
        </Link>
        <nav className="nav-links">
          <a href="/#popular">Рецепты</a>
          <Link href="/about">О Cooksy</Link>
        </nav>
        <div className="nav-actions">
          <Link className="button button-quiet add-link" href="/add">
            Добавить рецепт
          </Link>
          <Link className="button button-primary" href="/login">
            Войти
          </Link>
          <button
            type="button"
            aria-label="Переключить тему"
            className="theme-button"
            onClick={toggleTheme}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-menu">
            <Link href="/#popular" onClick={() => setMenuOpen(false)}>
              Рецепты
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>
              О Cooksy
            </Link>
            <Link href="/add" onClick={() => setMenuOpen(false)}>
              Добавить рецепт
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
