"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/recipe";

export function RecipeDetails({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState(recipe.servings);
  const factor = servings / recipe.servings;
  return (
    <div className="grid gap-10 md:grid-cols-[.85fr_1.15fr]">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Ингредиенты</h2>
          <label className="text-sm text-[#817970]">
            Порции{" "}
            <select
              className="ml-2 rounded-xl border border-[#eee4dc] bg-white px-2 py-2"
              value={servings}
              onChange={(event) => setServings(Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                <option key={count}>{count}</option>
              ))}
            </select>
          </label>
        </div>
        <ul className="mt-5 divide-y divide-[#eee7e0]">
          {recipe.ingredients.map((ingredient, index) => (
            <li
              key={`${ingredient.name}-${index}`}
              className="flex justify-between gap-3 py-3 text-sm"
            >
              <span>{ingredient.name}</span>
              <span className="text-[#817970]">
                {ingredient.measure}
                {factor !== 1
                  ? ` × ${factor.toFixed(2).replace(/\.00$/, "")}`
                  : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold">Приготовление</h2>
        <ol className="mt-5 space-y-5">
          {recipe.steps.map((step, index) => (
            <li key={index} className="flex gap-4 text-sm leading-6">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-xl bg-[#fff0e9] font-semibold text-[#F55220]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
