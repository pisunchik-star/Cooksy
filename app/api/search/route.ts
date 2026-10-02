import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { demoRecipes, type Recipe } from "@/lib/recipe";

const querySchema = z.string().trim().min(1).max(100);
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

function aiAllowed(ip: string, action = "generate", limit = 5) {
  const now = Date.now();
  const key = `${ip}:${action}`;
  const bucket = requestsByIp.get(key);
  if (!bucket || bucket.resetAt < now) {
    requestsByIp.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    request.nextUrl.searchParams.get("q") || "",
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Введите название блюда." },
      { status: 400 },
    );
  const query = parsed.data;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const cacheKey = query.toLocaleLowerCase("ru");
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase
      .from("recipes")
      .select(
        "id,title,description,image_url,prep_minutes,rating,source,servings,ingredients(name,measure),steps(instruction,position)",
      )
      .ilike("title", `%${query}%`)
      .limit(12);
    if (data?.length) {
      const recipes: Recipe[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        image: item.image_url || "",
        minutes: item.prep_minutes || 30,
        rating: item.rating || 0,
        source: item.source || "user",
        servings: item.servings || 2,
        ingredients: item.ingredients || [],
        steps: (item.steps || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((step: any) => step.instruction),
      }));
      return NextResponse.json({ recipes });
    }
    const { data: cached } = await supabase
      .from("recipes")
      .select(
        "id,title,description,image_url,prep_minutes,rating,source,servings,ingredients(name,measure),steps(instruction,position)",
      )
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (cached) {
      const recipe: Recipe = {
        id: cached.id,
        title: cached.title,
        description: cached.description || "",
        image: cached.image_url || "",
        minutes: cached.prep_minutes || 30,
        rating: cached.rating || 0,
        source: cached.source || "ai",
        servings: cached.servings || 2,
        ingredients: cached.ingredients || [],
        steps: (cached.steps || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((step: any) => step.instruction),
      };
      return NextResponse.json({ recipes: [recipe] });
    }
  }

  let apiQuery = query;
  let anthropic: Anthropic | null = null;
  if (
    process.env.ANTHROPIC_API_KEY &&
    /[а-яё]/i.test(query) &&
    aiAllowed(ip, "translate", 20)
  ) {
    try {
      anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const translation = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 80,
        system:
          "Translate the Russian dish name into a concise English search phrase. Return only the English phrase, no explanation.",
        messages: [{ role: "user", content: query }],
      });
      apiQuery =
        translation.content
          .find((block) => block.type === "text")
          ?.text.trim() || query;
    } catch {
      /* Search can continue using the original query. */
    }
  }
  try {
    const mealResponse = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(apiQuery)}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(7000) },
    );
    const mealData = await mealResponse.json();
    if (mealData.meals?.length) {
      const recipes: Recipe[] = mealData.meals
        .slice(0, 12)
        .map((meal: any) => ({
          id: `meal-${meal.idMeal}`,
          title: meal.strMeal,
          description: "Рецепт из открытого каталога TheMealDB.",
          image: meal.strMealThumb,
          minutes: 35,
          rating: 0,
          source: "catalog",
          sourceUrl: meal.strSource || meal.strMealThumb,
          servings: 4,
          ingredients: Array.from({ length: 20 }, (_, index) => ({
            name: meal[`strIngredient${index + 1}`],
            measure: meal[`strMeasure${index + 1}`],
          })).filter((part: any) => part.name?.trim()),
          steps: (meal.strInstructions || "")
            .split(/\r?\n/)
            .map((step: string) => step.trim())
            .filter(Boolean),
        }));
      return NextResponse.json({ recipes });
    }
  } catch {
    /* External catalog may be temporarily unavailable. */
  }

  if (process.env.ANTHROPIC_API_KEY && aiAllowed(ip)) {
    try {
      anthropic ||= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const completion = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        system:
          "Ты русскоязычный редактор рецептов. Верни только JSON-объект recipe: title, description, minutes (number), servings (number), ingredients (array объектов name и measure), steps (array строк). Не включай markdown.",
        messages: [
          {
            role: "user",
            content: `Создай оригинальный проверенный рецепт блюда: ${query}`,
          },
        ],
      });
      const text =
        completion.content.find((block) => block.type === "text")?.text || "{}";
      const generated = z
        .object({
          title: z.string(),
          description: z.string(),
          minutes: z.number(),
          servings: z.number(),
          ingredients: z.array(
            z.object({ name: z.string(), measure: z.string() }),
          ),
          steps: z.array(z.string()),
        })
        .safeParse(JSON.parse(text));
      if (generated.success) {
        const recipe: Recipe = {
          id: `ai-${Date.now()}`,
          ...generated.data,
          image: "",
          rating: 0,
          source: "ai",
        };
        if (supabase) {
          const { data: inserted } = await supabase
            .from("recipes")
            .insert({
              title: recipe.title,
              description: recipe.description,
              prep_minutes: recipe.minutes,
              servings: recipe.servings,
              source: "ai",
              cache_key: cacheKey,
            })
            .select("id")
            .single();
          if (inserted?.id) {
            recipe.id = inserted.id;
            await Promise.all([
              supabase
                .from("ingredients")
                .insert(
                  recipe.ingredients.map((item, position) => ({
                    recipe_id: inserted.id,
                    name: item.name,
                    measure: item.measure,
                    position,
                  })),
                ),
              supabase
                .from("steps")
                .insert(
                  recipe.steps.map((instruction, position) => ({
                    recipe_id: inserted.id,
                    instruction,
                    position,
                  })),
                ),
            ]);
          }
        }
        return NextResponse.json({ recipes: [recipe] });
      }
    } catch {
      /* A missing API key or invalid completion does not break public browsing. */
    }
  }

  const fallback = demoRecipes.filter((recipe) =>
    `${recipe.title} ${recipe.description} ${recipe.ingredients.map((item) => item.name).join(" ")}`
      .toLocaleLowerCase("ru")
      .includes(query.toLocaleLowerCase("ru")),
  );
  return NextResponse.json({
    recipes: fallback,
    empty: fallback.length === 0,
    aiUnavailable: !process.env.ANTHROPIC_API_KEY,
  });
}
