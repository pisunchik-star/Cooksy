import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { createServer } from "node:http";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = dirname(fileURLToPath(import.meta.url));
const dataDirectory = join(root, "data");
mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(join(dataDirectory, "cooksy.sqlite"));
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    prep_time TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    ingredients_json TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recipe_categories (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id, name)
  );

  CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes(created_at DESC);
  CREATE INDEX IF NOT EXISTS recipes_category_idx ON recipes(category);
  CREATE INDEX IF NOT EXISTS recipe_categories_visibility_idx ON recipe_categories(visibility, name);
`);

const cookieName = "cooksy_session";
const sessionLifetime = 30 * 24 * 60 * 60 * 1000;
const maxRequestBytes = 10 * 1024 * 1024;
const publicFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/script.js", ["script.js", "text/javascript; charset=utf-8"]],
]);

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(value));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxRequestBytes) {
        reject(
          Object.assign(new Error("Запрос слишком большой."), { status: 413 }),
        );
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(
          Object.assign(new Error("Не удалось прочитать данные формы."), {
            status: 400,
          }),
        );
      }
    });
    request.on("error", reject);
  });
}

function cookieValue(request, name) {
  const cookies = request.headers.cookie || "";
  const entry = cookies
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : "";
}

function sessionCookie(request, token, maxAge) {
  const secure =
    request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  return `${cookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function createSession(response, request, userId) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  database
    .prepare(
      "INSERT INTO sessions(token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    )
    .run(tokenHash, userId, Date.now() + sessionLifetime);
  response.setHeader(
    "Set-Cookie",
    sessionCookie(request, token, sessionLifetime / 1000),
  );
}

function findUser(request) {
  const token = cookieValue(request, cookieName);
  if (!token) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const row = database
    .prepare(
      `
    SELECT users.id, users.email, users.name
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `,
    )
    .get(tokenHash, Date.now());
  return row || null;
}

function recipeFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    time: row.prep_time,
    description: row.description,
    ingredients: JSON.parse(row.ingredients_json),
    steps: JSON.parse(row.steps_json),
    image: row.image,
    author: row.author_name,
  };
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/session") {
    return sendJson(response, 200, { user: findUser(request) });
  }

  if (request.method === "GET" && pathname === "/api/recipes") {
    const user = findUser(request);
    const rows = database
      .prepare(
        `
      SELECT recipes.*, users.name AS author_name
      FROM recipes JOIN users ON users.id = recipes.author_id
      WHERE NOT EXISTS (
        SELECT 1 FROM recipe_categories
        WHERE recipe_categories.name = recipes.category COLLATE NOCASE
          AND recipe_categories.visibility = 'private'
          AND recipe_categories.owner_id = recipes.author_id
      ) OR recipes.author_id = ?
      ORDER BY recipes.created_at DESC
    `,
      )
      .all(user?.id || "");
    return sendJson(response, 200, { recipes: rows.map(recipeFromRow) });
  }

  if (request.method === "GET" && pathname === "/api/categories") {
    const user = findUser(request);
    const categories = user
      ? database
          .prepare(
            `
          SELECT recipe_categories.name, recipe_categories.visibility, users.name AS owner_name
          FROM recipe_categories JOIN users ON users.id = recipe_categories.owner_id
          WHERE recipe_categories.visibility = 'public' OR recipe_categories.owner_id = ?
          ORDER BY recipe_categories.name COLLATE NOCASE
        `,
          )
          .all(user.id)
      : database
          .prepare(
            `
          SELECT recipe_categories.name, recipe_categories.visibility, users.name AS owner_name
          FROM recipe_categories JOIN users ON users.id = recipe_categories.owner_id
          WHERE recipe_categories.visibility = 'public'
          ORDER BY recipe_categories.name COLLATE NOCASE
        `,
          )
          .all();
    return sendJson(response, 200, { categories });
  }

  if (request.method === "POST" && pathname === "/api/register") {
    const body = await readJson(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (
      name.length < 2 ||
      name.length > 60 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 6 ||
      password.length > 200
    ) {
      return sendJson(response, 400, {
        error: "Проверьте имя, email и пароль (не менее 6 символов).",
      });
    }
    const salt = randomBytes(16);
    const passwordHash = scryptSync(password, salt, 64);
    const user = { id: randomUUID(), email, name };
    try {
      database
        .prepare(
          "INSERT INTO users(id, email, name, password_salt, password_hash) VALUES (?, ?, ?, ?, ?)",
        )
        .run(
          user.id,
          email,
          name,
          salt.toString("hex"),
          passwordHash.toString("hex"),
        );
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return sendJson(response, 409, {
          error: "Аккаунт с таким email уже существует.",
        });
      }
      throw error;
    }
    createSession(response, request, user.id);
    return sendJson(response, 201, { user });
  }

  if (request.method === "POST" && pathname === "/api/login") {
    const body = await readJson(request);
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const account = database
      .prepare(
        "SELECT id, email, name, password_salt, password_hash FROM users WHERE email = ?",
      )
      .get(email);
    const salt = account
      ? Buffer.from(account.password_salt, "hex")
      : Buffer.alloc(16);
    const expected = account
      ? Buffer.from(account.password_hash, "hex")
      : Buffer.alloc(64);
    const actual = scryptSync(password, salt, 64);
    if (!account || !timingSafeEqual(actual, expected)) {
      return sendJson(response, 401, {
        error: "Email или пароль не подходят.",
      });
    }
    createSession(response, request, account.id);
    return sendJson(response, 200, {
      user: { id: account.id, email: account.email, name: account.name },
    });
  }

  if (request.method === "POST" && pathname === "/api/logout") {
    const token = cookieValue(request, cookieName);
    if (token) {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      database
        .prepare("DELETE FROM sessions WHERE token_hash = ?")
        .run(tokenHash);
    }
    response.setHeader("Set-Cookie", sessionCookie(request, "", 0));
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "POST" && pathname === "/api/categories") {
    const user = findUser(request);
    if (!user) {
      return sendJson(response, 401, {
        error: "Войдите, чтобы создавать категории.",
      });
    }
    const body = await readJson(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const visibility = body.visibility;
    const builtInCategories = [
      "Завтрак",
      "Салат",
      "Суп",
      "Паста",
      "Десерт",
      "Главное",
    ];
    if (
      name.length < 2 ||
      name.length > 30 ||
      !/[\p{L}\p{N}]/u.test(name) ||
      !["public", "private"].includes(visibility)
    ) {
      return sendJson(response, 400, {
        error: "Введите название длиной от 2 до 30 символов и выберите доступ.",
      });
    }
    if (
      builtInCategories.some(
        (category) =>
          category.toLocaleLowerCase("ru") === name.toLocaleLowerCase("ru"),
      )
    ) {
      return sendJson(response, 409, {
        error: "Такая встроенная категория уже есть.",
      });
    }
    const duplicate = database
      .prepare(
        `
      SELECT id FROM recipe_categories
      WHERE name = ? COLLATE NOCASE
        AND (visibility = 'public' OR owner_id = ?)
    `,
      )
      .get(name, user.id);
    if (duplicate) {
      return sendJson(response, 409, {
        error: "Такая доступная вам категория уже существует.",
      });
    }
    const category = {
      id: randomUUID(),
      name,
      visibility,
      ownerName: user.name,
    };
    database
      .prepare(
        `
      INSERT INTO recipe_categories(id, owner_id, name, visibility)
      VALUES (?, ?, ?, ?)
    `,
      )
      .run(category.id, user.id, name, visibility);
    return sendJson(response, 201, { category });
  }

  if (request.method === "POST" && pathname === "/api/recipes") {
    const user = findUser(request);
    if (!user)
      return sendJson(response, 401, {
        error: "Войдите, чтобы опубликовать рецепт.",
      });
    const body = await readJson(request);
    const builtInCategories = new Set([
      "Завтрак",
      "Салат",
      "Суп",
      "Паста",
      "Десерт",
      "Главное",
    ]);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const category = typeof body.category === "string" ? body.category : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const ingredients = Array.isArray(body.ingredients)
      ? body.ingredients
          .filter((item) => typeof item === "string" && item.trim())
          .map((item) => item.trim())
      : [];
    const steps = Array.isArray(body.steps)
      ? body.steps
          .filter((item) => typeof item === "string" && item.trim())
          .map((item) => item.trim())
      : [];
    const image = typeof body.image === "string" ? body.image : "";
    if (
      title.length < 2 ||
      title.length > 70 ||
      !category ||
      !time ||
      time.length > 30 ||
      description.length > 180 ||
      ingredients.length < 1 ||
      ingredients.length > 40 ||
      ingredients.some((item) => item.length > 150) ||
      steps.length < 1 ||
      steps.length > 40 ||
      steps.some((step) => step.length > 500)
    ) {
      return sendJson(response, 400, {
        error: "Заполните название, время, ингредиенты и шаги рецепта.",
      });
    }
    if (!builtInCategories.has(category)) {
      const availableCategory = database
        .prepare(
          `
        SELECT id FROM recipe_categories
        WHERE name = ? COLLATE NOCASE
          AND (visibility = 'public' OR owner_id = ?)
      `,
        )
        .get(category, user.id);
      if (!availableCategory) {
        return sendJson(response, 400, {
          error: "Выберите доступную вам категорию.",
        });
      }
    }
    const validImage =
      image === "" ||
      (image.length <= 7_000_000 &&
        (/^https:\/\//i.test(image) ||
          /^data:image\/(jpeg|png|webp);base64,/i.test(image)));
    if (!validImage)
      return sendJson(response, 400, {
        error: "Выберите изображение до 8 МБ или HTTPS-ссылку.",
      });
    const recipe = {
      id: randomUUID(),
      title,
      category,
      time,
      description: description || "Домашний рецепт сообщества Cooksy.",
      ingredients,
      steps,
      image: image || "",
      author: user.name,
    };
    database
      .prepare(
        `
      INSERT INTO recipes(id, author_id, title, category, prep_time, description, ingredients_json, steps_json, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        recipe.id,
        user.id,
        recipe.title,
        recipe.category,
        recipe.time,
        recipe.description,
        JSON.stringify(ingredients),
        JSON.stringify(steps),
        recipe.image,
      );
    return sendJson(response, 201, { recipe });
  }

  return sendJson(response, 404, { error: "API endpoint not found." });
}

createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url.pathname);
      return;
    }
    if (request.method !== "GET") {
      response.writeHead(405, { Allow: "GET" });
      response.end("Method not allowed");
      return;
    }
    const file = publicFiles.get(url.pathname);
    if (!file) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    const [filename, contentType] = file;
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    response.end(readFileSync(join(root, filename)));
  } catch (error) {
    if (!response.headersSent) {
      sendJson(response, error.status || 500, {
        error: error.status ? error.message : "Внутренняя ошибка сервера.",
      });
    } else {
      response.destroy(error);
    }
    if (!error.status) console.error(error);
  }
}).listen(
  Number(process.env.PORT || 3000),
  process.env.HOST || "127.0.0.1",
  () => {
    const port = Number(process.env.PORT || 3000);
    console.log(`Cooksy is ready at http://localhost:${port}`);
    console.log(`SQLite database: ${join(dataDirectory, "cooksy.sqlite")}`);
  },
);
