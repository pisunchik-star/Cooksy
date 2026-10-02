"use client";

import { Flag, Heart, Star } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  profiles?: { display_name?: string } | null;
};

export function RecipeCommunity({ recipeId }: { recipeId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [rating, setRating] = useState(0);
  const [average, setAverage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (!supabase || !/^[0-9a-f-]{36}$/i.test(recipeId)) return;
    void (async () => {
      const [{ data: auth }, { data: commentData }, { data: ratings }] =
        await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("comments")
            .select("id,body,created_at,profiles(display_name)")
            .eq("recipe_id", recipeId)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("ratings")
            .select("author_id,score")
            .eq("recipe_id", recipeId),
        ]);
      const id = auth.user?.id || null;
      setUserId(id);
      setComments((commentData || []) as Comment[]);
      if (ratings?.length)
        setAverage(
          ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length,
        );
      if (id && ratings)
        setRating(ratings.find((item) => item.author_id === id)?.score || 0);
      if (id) {
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("recipe_id", recipeId)
          .eq("user_id", id)
          .maybeSingle();
        setFavorite(Boolean(data));
      }
    })();
  }, [recipeId, supabase]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !userId) return;
    const form = new FormData(event.currentTarget);
    const body = String(form.get("comment") || "").trim();
    if (body.length < 1 || body.length > 2000) return;
    const { error } = await supabase
      .from("comments")
      .insert({ recipe_id: recipeId, author_id: userId, body });
    if (error) setMessage(error.message);
    else {
      setComments([
        { id: crypto.randomUUID(), body, created_at: new Date().toISOString() },
        ...comments,
      ]);
      event.currentTarget.reset();
      setMessage("Комментарий добавлен.");
    }
  }

  async function selectRating(score: number) {
    if (!supabase || !userId) {
      setMessage("Войдите, чтобы оценить рецепт.");
      return;
    }
    const { error } = await supabase
      .from("ratings")
      .upsert(
        { recipe_id: recipeId, author_id: userId, score },
        { onConflict: "recipe_id,author_id" },
      );
    if (error) setMessage(error.message);
    else {
      setRating(score);
      setMessage("Оценка сохранена.");
    }
  }

  async function toggleFavorite() {
    if (!supabase || !userId) {
      setMessage("Войдите, чтобы сохранять избранное.");
      return;
    }
    if (favorite)
      await supabase
        .from("favorites")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", userId);
    else
      await supabase
        .from("favorites")
        .insert({ recipe_id: recipeId, user_id: userId });
    setFavorite(!favorite);
  }

  async function report() {
    if (!supabase || !userId) {
      setMessage("Войдите, чтобы пожаловаться на рецепт.");
      return;
    }
    const reason = window.prompt("Коротко опишите причину жалобы:");
    if (!reason) return;
    const { error } = await supabase
      .from("reports")
      .insert({
        reporter_id: userId,
        recipe_id: recipeId,
        reason: reason.slice(0, 500),
      });
    setMessage(error ? error.message : "Жалоба отправлена модераторам.");
  }

  if (!/^[0-9a-f-]{36}$/i.test(recipeId))
    return (
      <p className="mt-8 text-sm text-[#817970]">
        Оценки и комментарии доступны для рецептов сообщества.
      </p>
    );
  return (
    <section className="mt-10 border-t border-[#eee4dc] pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            Отзывы и комментарии
          </h2>
          <p className="mt-1 text-sm text-[#817970]">
            Средняя оценка: {average ? average.toFixed(1) : "пока нет оценок"}
          </p>
        </div>
        <button
          type="button"
          className="button button-quiet"
          onClick={toggleFavorite}
        >
          <Heart
            size={16}
            fill={favorite ? "#F55220" : "none"}
            color="#F55220"
          />
          {favorite ? "В избранном" : "В избранное"}
        </button>
      </div>
      <div className="mt-4 flex items-center gap-1" aria-label="Ваша оценка">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            type="button"
            key={score}
            aria-label={`Оценить на ${score}`}
            onClick={() => void selectRating(score)}
            className="p-1"
          >
            <Star
              size={21}
              fill={score <= rating ? "#F5A623" : "none"}
              color="#F5A623"
            />
          </button>
        ))}
        <button
          type="button"
          className="ml-4 inline-flex items-center gap-2 text-sm text-[#817970]"
          onClick={() => void report()}
        >
          <Flag size={15} /> Пожаловаться
        </button>
      </div>
      {userId ? (
        <form onSubmit={submitComment} className="mt-5">
          <textarea
            name="comment"
            required
            maxLength={2000}
            rows={3}
            className="w-full rounded-2xl border border-[#eee4dc] bg-white p-4"
            placeholder="Поделитесь впечатлением"
          />
          <button className="button button-primary mt-3" type="submit">
            Оставить комментарий
          </button>
        </form>
      ) : (
        <p className="mt-5 text-sm text-[#817970]">
          Войдите, чтобы оценить рецепт или оставить комментарий.{" "}
          <Link className="font-semibold text-[#F55220]" href="/login">
            Войти
          </Link>
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm text-[#817970]">
          {message}
        </p>
      )}
      <div className="mt-6 divide-y divide-[#eee4dc]">
        {comments.map((comment) => (
          <article className="py-4" key={comment.id}>
            <p className="text-sm leading-6">{comment.body}</p>
            <p className="mt-2 text-xs text-[#817970]">
              {comment.profiles?.display_name || "Пользователь"} ·{" "}
              {new Date(comment.created_at).toLocaleDateString("ru-RU")}
            </p>
            <button
              type="button"
              className="mt-2 text-xs text-[#817970]"
              onClick={() => {
                if (userId)
                  void supabase
                    ?.from("reports")
                    .insert({
                      reporter_id: userId,
                      comment_id: comment.id,
                      reason: "Жалоба на комментарий",
                    });
                else setMessage("Войдите, чтобы пожаловаться на комментарий.");
              }}
            >
              Пожаловаться на комментарий
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
