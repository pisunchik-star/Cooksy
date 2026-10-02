"use client";

import { Printer, Share2 } from "lucide-react";

export function RecipeActions() {
  async function share() {
    if (navigator.share)
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    else {
      await navigator.clipboard.writeText(window.location.href);
      window.alert("Ссылка на рецепт скопирована");
    }
  }
  return (
    <div className="flex gap-2 print:hidden">
      <button className="button button-quiet" onClick={share} type="button">
        <Share2 size={15} /> Поделиться
      </button>
      <button
        className="button button-quiet"
        onClick={() => window.print()}
        type="button"
      >
        <Printer size={15} /> Печать
      </button>
    </div>
  );
}
