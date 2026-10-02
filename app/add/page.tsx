"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { z } from "zod";

const recipeSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(500),
  category: z.string().min(1).max(50),
  prepMinutes: z.number().int().min(1).max(600),
  servings: z.number().int().min(1).max(30),
  difficulty: z.enum(["Легко", "Средне", "Сложно"]),
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        measure: z.string().trim().min(1).max(100),
      }),
    )
    .min(1)
    .max(60),
  steps: z.array(z.string().trim().min(1).max(1200)).min(1).max(40),
});

export default function AddRecipePage() {
  const [ingredients, setIngredients] = useState([{ name: "", measure: "" }]);
  const [steps, setSteps] = useState([""]);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setMessage("Добавьте параметры Supabase в .env.local.");
      return;
    }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      window.location.assign("/login");
      return;
    }
    const form = new FormData(formElement);
    const parsed = recipeSchema.safeParse({
      title: form.get("title"),
      description: form.get("description"),
      category: form.get("category"),
      prepMinutes: Number(form.get("prep_minutes")),
      servings: Number(form.get("servings")),
      difficulty: form.get("difficulty"),
      ingredients,
      steps,
    });
    if (!parsed.success) {
      setMessage("Проверьте название, описание, ингредиенты и шаги.");
      return;
    }
    const photo = form.get("photo");
    const imageFile = photo instanceof File && photo.size ? photo : null;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (
      imageFile &&
      (imageFile.size > 5 * 1024 * 1024 ||
        !allowedTypes.includes(imageFile.type))
    ) {
      setMessage("Фото должно быть JPEG, PNG или WebP размером до 5 МБ.");
      return;
    }
    const stepPhotos = form
      .getAll("step_photo")
      .map((item) => (item instanceof File && item.size ? item : null));
    if (
      stepPhotos.some(
        (file) =>
          file &&
          (file.size > 5 * 1024 * 1024 || !allowedTypes.includes(file.type)),
      )
    ) {
      setMessage("Фото шага должно быть JPEG, PNG или WebP размером до 5 МБ.");
      return;
    }
    setMessage("Публикуем рецепт…");
    let imageUrl: string | null = null;
    if (imageFile) {
      const path = `${auth.user.id}/${crypto.randomUUID()}.${imageFile.type.split("/")[1]}`;
      const upload = await supabase.storage
        .from("recipe-photos")
        .upload(path, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });
      if (upload.error) {
        setMessage(upload.error.message);
        return;
      }
      imageUrl = supabase.storage.from("recipe-photos").getPublicUrl(path)
        .data.publicUrl;
    }
    const stepImageUrls = await Promise.all(
      stepPhotos.map(async (file) => {
        if (!file) return null;
        const path = `${auth.user.id}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
        const upload = await supabase.storage
          .from("recipe-photos")
          .upload(path, file, { contentType: file.type, upsert: false });
        return upload.error
          ? null
          : supabase.storage.from("recipe-photos").getPublicUrl(path).data
              .publicUrl;
      }),
    );
    const { data: created, error } = await supabase
      .from("recipes")
      .insert({
        author_id: auth.user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        prep_minutes: parsed.data.prepMinutes,
        servings: parsed.data.servings,
        difficulty: parsed.data.difficulty,
        image_url: imageUrl,
        source: "user",
      })
      .select("id")
      .single();
    if (error || !created) {
      setMessage(error?.message || "Не удалось сохранить рецепт.");
      return;
    }
    const ingredientsResult = await supabase.from("ingredients").insert(
      parsed.data.ingredients.map((item, position) => ({
        recipe_id: created.id,
        name: item.name,
        measure: item.measure,
        position,
      })),
    );
    const stepsResult = await supabase
      .from("steps")
      .insert(
        parsed.data.steps.map((instruction, position) => ({
          recipe_id: created.id,
          instruction,
          image_url: stepImageUrls[position],
          position,
        })),
      );
    if (ingredientsResult.error || stepsResult.error) {
      await supabase.from("recipes").delete().eq("id", created.id);
      setMessage(
        "Не удалось сохранить состав рецепта. Проверьте настройки Supabase.",
      );
      return;
    }
    window.location.assign(`/recipe/${created.id}`);
  }
  return (
    <main className="page-shell min-h-screen">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link className="button button-quiet" href="/profile">
            Профиль
          </Link>
        </div>
      </header>
      <form
        className="container"
        onSubmit={submit}
        style={{ maxWidth: 800, padding: "46px 0 90px" }}
      >
        <span className="eyebrow">Ваша кухня</span>
        <h1
          style={{
            font: "600 40px var(--font-playfair),serif",
            margin: "10px 0 25px",
          }}
        >
          Новый рецепт
        </h1>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Название
            <input
              name="title"
              required
              maxLength={100}
              className="mt-2 block w-full rounded-2xl border border-[#eee4dc] bg-white p-4 font-normal"
              placeholder="Например, сырники с ягодами"
            />
          </label>
          <label className="text-sm font-semibold">
            Категория
            <select
              name="category"
              className="mt-2 block w-full rounded-2xl border border-[#eee4dc] bg-white p-4 font-normal"
            >
              {[
                "Завтрак",
                "Супы",
                "Горячее",
                "Салаты",
                "Выпечка",
                "Десерты",
                "Вегетарианское",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Описание
            <textarea
              name="description"
              required
              maxLength={500}
              className="mt-2 block w-full rounded-2xl border border-[#eee4dc] bg-white p-4 font-normal"
              rows={3}
              placeholder="Расскажите, чем хорош этот рецепт"
            />
          </label>
          <label className="text-sm font-semibold">
            Время, минут
            <input
              name="prep_minutes"
              type="number"
              min="1"
              max="600"
              defaultValue="30"
              className="mt-2 block w-full rounded-2xl border border-[#eee4dc] bg-white p-4 font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            Порций
            <input
              name="servings"
              type="number"
              min="1"
              max="30"
              defaultValue="2"
              className="mt-2 block w-full rounded-2xl border border-[#eee4dc] bg-white p-4 font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            Сложность
            <select
              name="difficulty"
              className="mt-2 block w-full rounded-2xl border border-[#eee4dc] bg-white p-4 font-normal"
            >
              <option>Легко</option>
              <option>Средне</option>
              <option>Сложно</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Главное фото
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 block w-full rounded-2xl border border-[#eee4dc] bg-white p-3 font-normal"
            />
          </label>
        </div>
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold">Ингредиенты</h2>
          {ingredients.map((item, index) => (
            <div className="mt-3 flex gap-2" key={index}>
              <input
                required
                maxLength={100}
                aria-label="Ингредиент"
                placeholder="Продукт"
                value={item.name}
                onChange={(event) =>
                  setIngredients(
                    ingredients.map((row, i) =>
                      i === index ? { ...row, name: event.target.value } : row,
                    ),
                  )
                }
                className="min-w-0 flex-1 rounded-2xl border border-[#eee4dc] bg-white p-3"
              />
              <input
                required
                aria-label="Количество"
                placeholder="Количество"
                value={item.measure}
                onChange={(event) =>
                  setIngredients(
                    ingredients.map((row, i) =>
                      i === index
                        ? { ...row, measure: event.target.value }
                        : row,
                    ),
                  )
                }
                className="min-w-0 flex-1 rounded-2xl border border-[#eee4dc] bg-white p-3"
              />
              <button
                type="button"
                aria-label="Удалить ингредиент"
                onClick={() =>
                  setIngredients(ingredients.filter((_, i) => i !== index))
                }
                className="px-2 text-[#817970]"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#F55220]"
            onClick={() =>
              setIngredients([...ingredients, { name: "", measure: "" }])
            }
          >
            <Plus size={17} /> Добавить ингредиент
          </button>
        </section>
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold">
            Шаги приготовления
          </h2>
          {steps.map((step, index) => (
            <div className="mt-3 flex items-start gap-3" key={index}>
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[#fff0e9] font-semibold text-[#F55220]">
                {index + 1}
              </span>
              <div className="flex-1">
                <textarea
                  required
                  maxLength={1200}
                  value={step}
                  onChange={(event) =>
                    setSteps(
                      steps.map((row, i) =>
                        i === index ? event.target.value : row,
                      ),
                    )
                  }
                  placeholder="Опишите шаг приготовления"
                  className="block w-full rounded-2xl border border-[#eee4dc] bg-white p-3"
                  rows={2}
                />
                <input
                  name="step_photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label={`Фото к шагу ${index + 1}`}
                  className="mt-2 block text-xs text-[#817970]"
                />
              </div>
              <button
                type="button"
                aria-label="Удалить шаг"
                onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                className="px-2 text-[#817970]"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#F55220]"
            onClick={() => setSteps([...steps, ""])}
          >
            <Plus size={17} /> Добавить шаг
          </button>
        </section>
        {message && (
          <p role="status" className="mt-5 text-sm text-[#F55220]">
            {message}
          </p>
        )}
        <button className="button button-primary mt-8" type="submit">
          Опубликовать рецепт
        </button>
      </form>
    </main>
  );
}
