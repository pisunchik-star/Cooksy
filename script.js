const searchInput = document.getElementById("searchInput");
const recipeGrid = document.getElementById("recipeGrid");
const authModal = document.getElementById("authModal");
const recipeModal = document.getElementById("recipeModal");
const detailModal = document.getElementById("detailModal");
const recipePhotoFile = document.getElementById("recipePhotoFile");
const recipePhotoPreview = document.getElementById("recipePhotoPreview");
const recipePhotoPreviewImage = document.getElementById(
  "recipePhotoPreviewImage",
);
const placeholderImage =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80";
const starterRecipes = [
  {
    id: "pasta-mushroom",
    title: "Кремовая паста с грибами",
    category: "Паста",
    time: "25 мин",
    description: "Нежный сливочный соус, ароматные грибы и тёртый пармезан.",
    ingredients: [
      "Паста — 250 г",
      "Шампиньоны — 200 г",
      "Сливки 20% — 200 мл",
      "Пармезан — 40 г",
      "Чеснок — 2 зубчика",
      "Оливковое масло — 1 ст. л.",
      "Соль и чёрный перец — по вкусу",
    ],
    steps: [
      "Отварите пасту в подсоленной воде до состояния al dente. Оставьте 100 мл воды от варки.",
      "Нарежьте грибы и обжарьте на масле 6–8 минут. Добавьте измельчённый чеснок.",
      "Влейте сливки, добавьте соль и перец, прогрейте 2 минуты.",
      "Переложите пасту в соус. При необходимости добавьте немного воды от варки. Подавайте с пармезаном.",
    ],
    image:
      "https://images.unsplash.com/photo-1597692493647-35763cb92183?auto=format&fit=crop&w=800&q=85",
    author: "Cooksy",
  },
  {
    id: "avocado-toast",
    title: "Авокадо тосты с яйцом",
    category: "Завтрак",
    time: "15 мин",
    description: "Хрустящий тост с нежным авокадо и яйцом на завтрак.",
    ingredients: [
      "Хлеб цельнозерновой — 2 ломтика",
      "Авокадо спелый — 1 шт. (около 150 г)",
      "Яйца — 2 шт.",
      "Лимонный сок — 1 ч. л.",
      "Оливковое масло — 1 ч. л.",
      "Соль и перец — по вкусу",
    ],
    steps: [
      "Подрумяньте хлеб в тостере или на сухой сковороде.",
      "Разомните мякоть авокадо с лимонным соком, солью и перцем.",
      "Пожарьте яйца на сковороде с каплей масла до желаемой готовности.",
      "Намажьте авокадо на тосты, сверху выложите яйца.",
    ],
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    author: "Cooksy",
  },
  {
    id: "citrus-salad",
    title: "Цитрусовый салат с курицей",
    category: "Салат",
    time: "20 мин",
    description: "Свежий салат с сочным апельсином и куриным филе.",
    ingredients: [
      "Куриное филе — 250 г",
      "Салатные листья — 100 г",
      "Апельсин — 1 шт. (около 180 г)",
      "Огурец — 1 шт. (150 г)",
      "Оливковое масло — 2 ст. л.",
      "Лимонный сок — 1 ст. л.",
      "Соль и перец — по вкусу",
    ],
    steps: [
      "Посолите и поперчите филе, обжарьте по 5–6 минут с каждой стороны до готовности. Остудите и нарежьте.",
      "Очистите апельсин от кожуры и плёнок, нарежьте мякоть. Огурец нарежьте тонкими ломтиками.",
      "Смешайте масло с лимонным соком и щепоткой соли.",
      "Выложите салатные листья, курицу, огурец и апельсин. Полейте заправкой.",
    ],
    image:
      "https://images.unsplash.com/photo-1690573313202-4493a7d02e9c?auto=format&fit=crop&w=800&q=85",
    author: "Cooksy",
  },
  {
    id: "honey-chicken",
    title: "Курица в медовом соусе",
    category: "Главное",
    time: "40 мин",
    description: "Сочная запечённая курица в сладко-солёной глазури.",
    ingredients: [
      "Куриные бёдра — 700 г",
      "Мёд — 2 ст. л. (40 г)",
      "Соевый соус — 3 ст. л. (45 мл)",
      "Чеснок — 3 зубчика",
      "Растительное масло — 1 ст. л.",
      "Паприка — 1 ч. л.",
      "Чёрный перец — по вкусу",
    ],
    steps: [
      "Разогрейте духовку до 200 °C.",
      "Смешайте мёд, соевый соус, масло, измельчённый чеснок, паприку и перец.",
      "Обмажьте курицу соусом и выложите в форму.",
      "Запекайте 30–35 минут до золотистой корочки и полной готовности.",
    ],
    image:
      "https://images.unsplash.com/photo-1642497394376-74bf7c38ab23?auto=format&fit=crop&w=800&q=85",
    author: "Cooksy",
  },
  {
    id: "tomato-soup",
    title: "Томатный суп с чечевицей",
    category: "Суп",
    time: "35 мин",
    description: "Густой согревающий суп с мягкой чечевицей и томатами.",
    ingredients: [
      "Красная чечевица — 180 г",
      "Томаты в собственном соку — 400 г",
      "Овощной бульон или вода — 700 мл",
      "Морковь — 1 шт. (100 г)",
      "Лук — 1 шт. (100 г)",
      "Оливковое масло — 1 ст. л.",
      "Кумин — ½ ч. л.",
      "Соль — ½ ч. л.",
    ],
    steps: [
      "Мелко нарежьте лук, натрите морковь и обжарьте их в кастрюле на масле 5 минут.",
      "Добавьте кумин и промытую чечевицу, перемешайте.",
      "Добавьте томаты и бульон. Доведите до кипения.",
      "Варите на небольшом огне 20–25 минут, пока чечевица не станет мягкой. Посолите.",
    ],
    image:
      "https://images.unsplash.com/photo-1553881781-4c55163dc5fd?auto=format&fit=crop&w=800&q=85",
    author: "Cooksy",
  },
  {
    id: "syrniki",
    title: "Нежные сырники",
    category: "Завтрак",
    time: "25 мин",
    description: "Румяные сырники из творога с ванилью и сметаной.",
    ingredients: [
      "Творог 5% — 400 г",
      "Яйцо — 1 шт.",
      "Пшеничная мука — 50 г + 2 ст. л. для обсыпки",
      "Сахар — 2 ст. л. (30 г)",
      "Ванильный сахар — 1 ч. л.",
      "Растительное масло — 1 ст. л.",
      "Сметана для подачи — 100 г",
    ],
    steps: [
      "Разомните творог вилкой и смешайте с яйцом, сахаром и ванильным сахаром.",
      "Добавьте 50 г муки. Сформируйте небольшие сырники и слегка обваляйте в муке.",
      "Обжаривайте на среднем огне в небольшом количестве масла по 3–4 минуты с каждой стороны.",
      "Накройте крышкой и готовьте ещё 2 минуты на слабом огне. Подавайте со сметаной.",
    ],
    image:
      "https://images.unsplash.com/photo-1775816802938-fc4b0b095b40?auto=format&fit=crop&w=800&q=85",
    author: "Cooksy",
  },
  {
    id: "baked-salmon",
    title: "Лосось с лимоном в духовке",
    category: "Главное",
    time: "25 мин",
    description: "Нежная рыба с лимоном и травами для лёгкого ужина.",
    ingredients: [
      "Филе лосося — 2 куска (по 150 г)",
      "Лимон — ½ шт. (30 мл сока)",
      "Оливковое масло — 1 ст. л. (15 мл)",
      "Укроп — 10 г",
      "Чеснок — 1 зубчик",
      "Соль — ½ ч. л.",
      "Чёрный перец — по вкусу",
    ],
    steps: [
      "Разогрейте духовку до 200 °C и застелите противень бумагой для выпечки.",
      "Смешайте масло, лимонный сок, измельчённый чеснок, соль и перец.",
      "Смажьте рыбу смесью и выложите на противень.",
      "Запекайте 12–15 минут. Перед подачей посыпьте укропом.",
    ],
    image:
      "https://images.unsplash.com/photo-1575835638288-74138ce93c0e?auto=format&fit=crop&w=800&q=85",
    author: "Cooksy",
  },
  {
    id: "apple-crumble",
    title: "Яблочный крамбл с корицей",
    category: "Десерт",
    time: "40 мин",
    description: "Тёплые яблоки под хрустящей овсяной крошкой.",
    ingredients: [
      "Яблоки — 4 шт. (около 600 г)",
      "Овсяные хлопья — 100 г",
      "Пшеничная мука — 80 г",
      "Сливочное масло холодное — 80 г",
      "Сахар — 70 г",
      "Корица — 1 ч. л.",
      "Лимонный сок — 1 ч. л.",
    ],
    steps: [
      "Разогрейте духовку до 180 °C. Нарежьте яблоки кубиками и смешайте с лимонным соком и корицей.",
      "Разотрите холодное масло с мукой, овсяными хлопьями и сахаром до крупной крошки.",
      "Выложите яблоки в форму для запекания и равномерно покройте крошкой.",
      "Запекайте 30–35 минут до золотистой корочки. Дайте постоять 10 минут.",
    ],
    image:
      "https://images.unsplash.com/photo-1706799419621-14d7f424de83?auto=format&fit=crop&w=800&q=85",
    author: "Cooksy",
  },
];
let recipes = [...starterRecipes];
let currentUser = null;
let favorites = readStorage("cooksy-favorites", []);
let authMode = "login";
let activeCategory = "";
let uploadedRecipeImage = "";
let showAllRecipes = false;
let searchScrollTimer = 0;
let lastFocusedRecipeCard = null;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

async function requestApi(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Не удалось выполнить запрос.");
  }
  return result;
}

async function loadDatabaseData() {
  try {
    const [sessionResult, recipeResult, categoryResult] = await Promise.all([
      requestApi("/api/session"),
      requestApi("/api/recipes"),
      requestApi("/api/categories"),
    ]);
    currentUser = sessionResult.user;
    recipes = [...recipeResult.recipes, ...starterRecipes];
    renderRecipeCategories(categoryResult.categories);
    updateAccountButton();
    renderRecipes();
  } catch {
    document.getElementById("recipeMessage").textContent =
      "База данных недоступна. Запустите сайт командой npm run dev.";
  }
}

function renderRecipeCategories(categories) {
  const select = document.getElementById("recipeCategory");
  const selectedValue = select.value;
  select
    .querySelectorAll("option[data-custom-category]")
    .forEach((option) => option.remove());
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = `${category.name} (${category.visibility === "private" ? "приватная" : "публичная"})`;
    option.dataset.customCategory = "true";
    select.append(option);
  });
  select.value = [...select.options].some(
    (option) => option.value === selectedValue,
  )
    ? selectedValue
    : select.options[0].value;
}

async function refreshRecipeCategories() {
  const { categories } = await requestApi("/api/categories");
  renderRecipeCategories(categories);
  return categories;
}

async function prepareRecipeImage(file) {
  const bitmap = await createImageBitmap(file);
  const maxSize = 1200;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const button = document.getElementById("themeToggle");
  const isDark = theme === "dark";
  button.innerHTML = `<span aria-hidden="true">${isDark ? "☀" : "☾"}</span>`;
  button.setAttribute(
    "aria-label",
    isDark ? "Включить светлую тему" : "Включить тёмную тему",
  );
}

function renderRecipes() {
  const query = searchInput.value.trim().toLocaleLowerCase("ru");
  const visibleRecipes = recipes.filter((recipe) => {
    const matchesText =
      `${recipe.title} ${recipe.category} ${recipe.description} ${(recipe.ingredients || []).join(" ")}`
        .toLocaleLowerCase("ru")
        .includes(query);
    return (
      matchesText && (!activeCategory || recipe.category === activeCategory)
    );
  });
  recipeGrid.replaceChildren();
  const moreRecipesButton = document.getElementById("showAllRecipes");

  if (!visibleRecipes.length) {
    moreRecipesButton.classList.add("hidden");
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "Пока нет рецептов по этому запросу. Попробуйте другой поиск.";
    recipeGrid.append(empty);
    return;
  }

  const shouldLimitRecipes = !query && !activeCategory && !showAllRecipes;
  const recipesToRender = shouldLimitRecipes
    ? visibleRecipes.slice(0, 6)
    : visibleRecipes;
  moreRecipesButton.classList.toggle(
    "hidden",
    !shouldLimitRecipes || visibleRecipes.length <= recipesToRender.length,
  );

  recipesToRender.forEach((recipe) => {
    const card = document.createElement("article");
    card.className = "recipe-card";
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "recipe-open";
    openButton.setAttribute("aria-label", `Открыть рецепт: ${recipe.title}`);
    openButton.dataset.recipeId = recipe.id;

    const image = document.createElement("img");
    image.src = recipe.image || placeholderImage;
    image.alt = recipe.title;
    image.loading = "lazy";
    image.addEventListener(
      "error",
      () => {
        image.src = placeholderImage;
      },
      { once: true },
    );

    const info = document.createElement("div");
    info.className = "recipe-info";
    const meta = document.createElement("div");
    meta.className = "meta-row";
    const category = document.createElement("span");
    category.textContent = recipe.category;
    const time = document.createElement("span");
    time.textContent = recipe.time;
    meta.append(category, time);
    const title = document.createElement("h3");
    title.textContent = recipe.title;
    const description = document.createElement("p");
    description.textContent = recipe.description.split("\n")[0];
    const actions = document.createElement("div");
    actions.className = "recipe-card-actions";
    const author = document.createElement("span");
    author.className = "recipe-author";
    author.textContent = recipe.author
      ? `От ${recipe.author}`
      : "Рецепт сообщества";
    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = `favorite-btn icon-btn${favorites.includes(recipe.id) ? " is-favorite" : ""}`;
    favorite.dataset.favoriteId = recipe.id;
    favorite.setAttribute(
      "aria-label",
      favorites.includes(recipe.id)
        ? "Убрать из избранного"
        : "Добавить в избранное",
    );
    favorite.innerHTML = `<span aria-hidden="true">${favorites.includes(recipe.id) ? "♥" : "♡"}</span>`;
    actions.append(author, favorite);
    info.append(meta, title, description);
    openButton.append(image, info);
    card.append(openButton, actions);
    recipeGrid.append(card);
  });
}

document.getElementById("showAllRecipes").addEventListener("click", () => {
  showAllRecipes = true;
  renderRecipes();
});

function clearCategoryFilter() {
  activeCategory = "";
  document
    .querySelectorAll(".category-card")
    .forEach((item) => item.classList.remove("is-active"));
}

function runSearch() {
  window.clearTimeout(searchScrollTimer);
  clearCategoryFilter();
  renderRecipes();
  scrollToFirstSearchResult();
}

function scrollToFirstSearchResult() {
  if (!searchInput.value.trim()) return;
  const firstRecipeCard = recipeGrid.querySelector(".recipe-card");
  if (!firstRecipeCard) return;

  lastFocusedRecipeCard?.classList.remove("search-result-focus");
  lastFocusedRecipeCard = firstRecipeCard;
  firstRecipeCard.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "center",
  });
  firstRecipeCard.classList.remove("search-result-focus");
  void firstRecipeCard.offsetWidth;
  firstRecipeCard.classList.add("search-result-focus");
  window.setTimeout(
    () => firstRecipeCard.classList.remove("search-result-focus"),
    1400,
  );
}

function showModal(modal) {
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  modal.querySelector("input, button")?.focus();
}

function hideModal(modal) {
  modal.classList.add("hidden");
  if (
    ![authModal, recipeModal, detailModal].some(
      (item) => !item.classList.contains("hidden"),
    )
  ) {
    document.body.classList.remove("modal-open");
  }
}

function openAuth(mode = "login") {
  authMode = mode;
  updateAuthMode();
  document.getElementById("authMessage").textContent = "";
  showModal(authModal);
}

function updateAuthMode() {
  const isRegister = authMode === "register";
  document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authMode === authMode);
  });
  document
    .querySelector(".register-only")
    .classList.toggle("hidden", !isRegister);
  document.querySelector(".register-only input").required = isRegister;
  document.getElementById("authTitle").textContent = isRegister
    ? "Создать аккаунт"
    : "Рады вас видеть";
  document.getElementById("authSubmit").textContent = isRegister
    ? "Зарегистрироваться"
    : "Войти";
}

function updateAccountButton() {
  const button = document.getElementById("accountButton");
  button.textContent = currentUser ? currentUser.name : "Войти";
  button.title = currentUser
    ? "Нажмите, чтобы выйти"
    : "Войти или зарегистрироваться";
}

function openRecipe(recipe) {
  const image = document.getElementById("detailImage");
  image.src = recipe.image || placeholderImage;
  image.alt = recipe.title;
  image.onerror = () => {
    image.src = placeholderImage;
  };
  document.getElementById("detailCategory").textContent = recipe.category;
  document.getElementById("detailTime").textContent = recipe.time;
  document.getElementById("detailTitle").textContent = recipe.title;
  document.getElementById("detailDescription").textContent = recipe.description;
  const ingredientList = document.getElementById("detailIngredients");
  ingredientList.replaceChildren();
  (recipe.ingredients || []).forEach((ingredient) => {
    const item = document.createElement("li");
    item.textContent = ingredient;
    ingredientList.append(item);
  });
  if (!ingredientList.children.length) {
    const item = document.createElement("li");
    item.textContent = "Автор пока не добавил список ингредиентов.";
    ingredientList.append(item);
  }
  const stepList = document.getElementById("detailSteps");
  stepList.replaceChildren();
  (recipe.steps || []).forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    stepList.append(item);
  });
  if (!stepList.children.length) {
    const item = document.createElement("li");
    item.textContent = "Автор пока не добавил шаги приготовления.";
    stepList.append(item);
  }
  document.getElementById("detailAuthor").textContent = recipe.author
    ? `Автор: ${recipe.author}`
    : "Рецепт сообщества Cooksy";
  showModal(detailModal);
}

document.getElementById("themeToggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  saveStorage("cooksy-theme", nextTheme);
  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 260);
});

setTheme(readStorage("cooksy-theme", "light"));
updateAccountButton();
renderRecipes();
loadDatabaseData();

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  window.clearTimeout(searchScrollTimer);
  if (query) clearCategoryFilter();
  renderRecipes();
  if (query) {
    searchScrollTimer = window.setTimeout(scrollToFirstSearchResult, 850);
  } else {
    lastFocusedRecipeCard = null;
  }
});
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    runSearch();
  }
});
document.getElementById("searchButton").addEventListener("click", runSearch);
document.querySelectorAll(".category-card").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.hasAttribute("data-all-recipes")) {
      window.clearTimeout(searchScrollTimer);
      searchInput.value = "";
      activeCategory = "";
      showAllRecipes = true;
    } else {
      const category = button.dataset.category;
      activeCategory = activeCategory === category ? "" : category;
    }

    document
      .querySelectorAll(".category-card")
      .forEach((item) =>
        item.classList.toggle(
          "is-active",
          item.dataset.category === activeCategory ||
            (!activeCategory && item.hasAttribute("data-all-recipes")),
        ),
      );
    renderRecipes();
    document.getElementById("recipes").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("accountButton").addEventListener("click", async () => {
  if (currentUser) {
    if (window.confirm("Выйти из аккаунта?")) {
      try {
        await requestApi("/api/logout", { method: "POST" });
        currentUser = null;
        updateAccountButton();
      } catch (error) {
        window.alert(error.message);
      }
    }
    return;
  }
  openAuth();
});

document.getElementById("shareRecipeButton").addEventListener("click", () => {
  if (!currentUser) {
    openAuth("register");
    return;
  }
  document.getElementById("recipeMessage").textContent = "";
  showModal(recipeModal);
});

const categoryCreator = document.getElementById("categoryCreator");
const categoryCreatorToggle = document.getElementById("createCategoryToggle");

categoryCreatorToggle.addEventListener("click", () => {
  const isOpen = categoryCreator.classList.toggle("hidden") === false;
  categoryCreatorToggle.setAttribute("aria-expanded", String(isOpen));
  categoryCreatorToggle.textContent = isOpen
    ? "Отмена"
    : "＋ Создать категорию";
  document.getElementById("categoryMessage").textContent = "";
  if (isOpen) document.getElementById("newCategoryName").focus();
});

document
  .getElementById("saveRecipeCategory")
  .addEventListener("click", async () => {
    const nameInput = document.getElementById("newCategoryName");
    const message = document.getElementById("categoryMessage");
    const name = nameInput.value.trim();
    const visibility = document.querySelector(
      'input[name="categoryVisibility"]:checked',
    ).value;
    if (name.length < 2 || name.length > 30) {
      message.textContent =
        "Название категории должно быть длиной от 2 до 30 символов.";
      nameInput.focus();
      return;
    }

    const button = document.getElementById("saveRecipeCategory");
    button.disabled = true;
    try {
      const { category } = await requestApi("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name, visibility }),
      });
      await refreshRecipeCategories();
      document.getElementById("recipeCategory").value = category.name;
      nameInput.value = "";
      message.textContent =
        visibility === "public"
          ? "Публичная категория добавлена и доступна всем авторам."
          : "Приватная категория добавлена и доступна только вам.";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

recipePhotoFile.addEventListener("change", async () => {
  const message = document.getElementById("recipeMessage");
  const file = recipePhotoFile.files?.[0];
  uploadedRecipeImage = "";
  recipePhotoPreview.classList.add("hidden");
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    recipePhotoFile.value = "";
    message.textContent = "Выберите файл изображения.";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    recipePhotoFile.value = "";
    message.textContent = "Размер фотографии должен быть не больше 8 МБ.";
    return;
  }
  try {
    uploadedRecipeImage = await prepareRecipeImage(file);
    recipePhotoPreviewImage.src = uploadedRecipeImage;
    recipePhotoPreview.classList.remove("hidden");
    message.textContent = "Фото прикреплено.";
  } catch {
    recipePhotoFile.value = "";
    message.textContent =
      "Не удалось открыть фотографию. Попробуйте другой файл.";
  }
});

document.getElementById("removeRecipePhoto").addEventListener("click", () => {
  uploadedRecipeImage = "";
  recipePhotoFile.value = "";
  recipePhotoPreviewImage.removeAttribute("src");
  recipePhotoPreview.classList.add("hidden");
});

document.querySelectorAll("[data-auth-mode]").forEach((tab) =>
  tab.addEventListener("click", () => {
    authMode = tab.dataset.authMode;
    updateAuthMode();
    document.getElementById("authMessage").textContent = "";
  }),
);

document
  .getElementById("authForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const authForm = event.currentTarget;
    const form = new FormData(authForm);
    const message = document.getElementById("authMessage");
    try {
      const endpoint = authMode === "register" ? "/api/register" : "/api/login";
      const result = await requestApi(endpoint, {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") || "").trim(),
          email: String(form.get("email")).trim().toLowerCase(),
          password: String(form.get("password")),
        }),
      });
      currentUser = result.user;
      await refreshRecipeCategories();
      updateAccountButton();
      authForm.reset();
      hideModal(authModal);
    } catch (error) {
      message.textContent = error.message;
    }
  });

document
  .getElementById("recipeForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const recipeForm = event.currentTarget;
    if (!currentUser) {
      hideModal(recipeModal);
      openAuth("login");
      return;
    }
    const form = new FormData(recipeForm);
    const imageValue = String(form.get("imageUrl")).trim();
    const image =
      uploadedRecipeImage ||
      (imageValue && /^https:\/\//i.test(imageValue) ? imageValue : "");
    const submitButton = recipeForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await requestApi("/api/recipes", {
        method: "POST",
        body: JSON.stringify({
          title: String(form.get("title")).trim(),
          category: String(form.get("category")),
          time: String(form.get("time")).trim(),
          description: String(form.get("description")).trim(),
          ingredients: String(form.get("ingredients"))
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          steps: String(form.get("steps"))
            .split("\n")
            .map((item) => item.trim().replace(/^\d+[.)]\s*/, ""))
            .filter(Boolean),
          image,
        }),
      });
      recipes.unshift(result.recipe);
      recipeForm.reset();
      uploadedRecipeImage = "";
      recipePhotoPreviewImage.removeAttribute("src");
      recipePhotoPreview.classList.add("hidden");
      activeCategory = "";
      document
        .querySelectorAll(".category-card")
        .forEach((item) => item.classList.remove("is-active"));
      searchInput.value = "";
      renderRecipes();
      hideModal(recipeModal);
      document.getElementById("recipes").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      document.getElementById("recipeMessage").textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

recipeGrid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite-id]");
  if (favoriteButton) {
    event.stopPropagation();
    const id = favoriteButton.dataset.favoriteId;
    favorites = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    saveStorage("cooksy-favorites", favorites);
    renderRecipes();
    return;
  }
  const openButton = event.target.closest("[data-recipe-id]");
  if (openButton) {
    openRecipe(
      recipes.find((recipe) => recipe.id === openButton.dataset.recipeId),
    );
  }
});

document.querySelectorAll("[data-close-modal]").forEach((button) =>
  button.addEventListener("click", () => {
    [authModal, recipeModal, detailModal].forEach((modal) => hideModal(modal));
  }),
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape")
    [authModal, recipeModal, detailModal].forEach((modal) => hideModal(modal));
});
