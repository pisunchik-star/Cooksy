import { notFound } from "next/navigation";
import { Clock3, Star } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { demoRecipes, type Recipe } from "@/lib/recipe";
import { RecipeDetails } from "@/components/RecipeDetails";
import { RecipeActions } from "@/components/RecipeActions";
import { RecipeCommunity } from "@/components/RecipeCommunity";
import { getSupabaseAdmin } from "@/lib/supabase";

async function getRecipe(id: string): Promise<Recipe | null> {
  const demo = demoRecipes.find((recipe) => recipe.id === id);
  if (demo) return demo;
  const supabase = getSupabaseAdmin();
  if (supabase && /^[0-9a-f-]{36}$/i.test(id)) {
    const { data } = await supabase
      .from("recipes")
      .select(
        "id,title,description,image_url,prep_minutes,rating,source,source_url,servings,ingredients(name,measure,position),steps(instruction,position)",
      )
      .eq("id", id)
      .maybeSingle();
    if (data)
      return {
        id: data.id,
        title: data.title,
        description: data.description || "",
        image: data.image_url || "",
        minutes: data.prep_minutes,
        rating: data.rating || 0,
        source: data.source || "user",
        sourceUrl: data.source_url,
        servings: data.servings,
        ingredients: (data.ingredients || []).sort(
          (a: any, b: any) => a.position - b.position,
        ),
        steps: (data.steps || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((step: any) => step.instruction),
      };
  }
  if (id.startsWith("meal-")) {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id.slice(5))}`,
        { next: { revalidate: 3600 } },
      );
      const { meals } = await response.json();
      const meal = meals?.[0];
      if (meal)
        return {
          id,
          title: meal.strMeal,
          description: "Рецепт из открытого каталога TheMealDB.",
          image: meal.strMealThumb,
          minutes: 35,
          rating: 0,
          source: "catalog",
          sourceUrl: meal.strSource,
          servings: 4,
          ingredients: Array.from({ length: 20 }, (_, index) => ({
            name: meal[`strIngredient${index + 1}`],
            measure: meal[`strMeasure${index + 1}`],
          })).filter((part: any) => part.name?.trim()),
          steps: (meal.strInstructions || "")
            .split(/\r?\n/)
            .map((step: string) => step.trim())
            .filter(Boolean),
        };
    } catch {
      return null;
    }
  }
  return null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);
  return {
    title: recipe ? `${recipe.title} — Cooksy` : "Рецепт — Cooksy",
    description: recipe?.description,
    openGraph: recipe ? { images: [recipe.image] } : undefined,
  };
}

export default async function RecipePage({
  params,
}: {
  params: { id: string };
}) {
  const recipe = await getRecipe(params.id);
  if (!recipe) notFound();
  return (
    <main className="page-shell min-h-screen">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link className="button button-quiet" href="/search?q=популярное">
            Все рецепты
          </Link>
        </div>
      </header>
      <article
        className="container"
        style={{ maxWidth: 900, paddingTop: 36, paddingBottom: 80 }}
      >
        <div
          className="recipe-image"
          style={{ aspectRatio: "2 / 1", borderRadius: 24 }}
        >
          {recipe.image && <img src={recipe.image} alt={recipe.title} />}
          <span className="recipe-badge">
            {recipe.source === "ai"
              ? "Рецепт создан ИИ"
              : recipe.source === "user"
                ? "От пользователя"
                : "Из каталога"}
          </span>
        </div>
        <div style={{ padding: "26px 0" }}>
          <span className="eyebrow">Cooksy рекомендует</span>
          <h1
            style={{
              font: "600 clamp(34px,5vw,50px)/1.15 var(--font-playfair),serif",
              margin: "10px 0",
            }}
          >
            {recipe.title}
          </h1>
          <p style={{ color: "#817970", fontSize: 16 }}>{recipe.description}</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              color: "#817970",
              fontSize: 14,
              marginTop: 20,
            }}
          >
            <span>
              <Clock3 size={16} style={{ verticalAlign: "middle" }} />{" "}
              {recipe.minutes} минут
            </span>
            <span>
              <Star
                size={16}
                fill="#F5A623"
                color="#F5A623"
                style={{ verticalAlign: "middle" }}
              />{" "}
              {recipe.rating || "Новый"}
            </span>
            <RecipeActions />
          </div>
        </div>
        <RecipeDetails recipe={recipe} />
        {recipe.sourceUrl && (
          <p style={{ marginTop: 24, color: "#817970", fontSize: 13 }}>
            Источник:{" "}
            <a
              href={recipe.sourceUrl}
              rel="noreferrer"
              target="_blank"
              style={{ color: "#F55220" }}
            >
              TheMealDB
            </a>
          </p>
        )}
        <RecipeCommunity recipeId={recipe.id} />
      </article>
    </main>
  );
}
