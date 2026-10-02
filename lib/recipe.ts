export type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string;
  minutes: number;
  rating: number;
  source: "user" | "catalog" | "ai";
  sourceUrl?: string;
  ingredients: { name: string; measure: string }[];
  steps: string[];
  servings: number;
};

export const demoRecipes: Recipe[] = [
  {
    id: "creamy-pasta",
    title: "Паста с нежным сливочным соусом",
    description:
      "Быстрый ужин с ароматным соусом, который получается с первого раза.",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85",
    minutes: 20,
    rating: 4.9,
    source: "user",
    servings: 2,
    ingredients: [
      { name: "Паста", measure: "200 г" },
      { name: "Сливки 20%", measure: "150 мл" },
      { name: "Пармезан", measure: "40 г" },
      { name: "Чеснок", measure: "1 зубчик" },
    ],
    steps: [
      "Отварите пасту в подсоленной воде до состояния al dente.",
      "На сковороде прогрейте сливки с измельчённым чесноком.",
      "Добавьте тёртый пармезан и пасту, перемешайте и подавайте горячей.",
    ],
  },
  {
    id: "avocado-toast",
    title: "Тост с авокадо и яйцом пашот",
    description:
      "Хрустящий хлеб, спелое авокадо и нежное яйцо для идеального завтрака.",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=85",
    minutes: 15,
    rating: 4.8,
    source: "user",
    servings: 2,
    ingredients: [
      { name: "Хлеб", measure: "2 ломтика" },
      { name: "Авокадо", measure: "1 шт." },
      { name: "Яйцо", measure: "2 шт." },
      { name: "Лимонный сок", measure: "1 ч. л." },
    ],
    steps: [
      "Подрумяньте хлеб на сухой сковороде.",
      "Разомните авокадо с лимонным соком, добавьте соль и перец.",
      "Приготовьте яйца пашот и выложите на тосты с авокадо.",
    ],
  },
  {
    id: "tomato-soup",
    title: "Томатный суп с базиликом",
    description:
      "Насыщенный суп из томатов с душистым базиликом и каплей сливок.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
    minutes: 30,
    rating: 4.9,
    source: "catalog",
    servings: 4,
    ingredients: [
      { name: "Томаты", measure: "700 г" },
      { name: "Лук", measure: "1 шт." },
      { name: "Овощной бульон", measure: "500 мл" },
      { name: "Базилик", measure: "10 г" },
    ],
    steps: [
      "Нарежьте лук и обжарьте до мягкости.",
      "Добавьте томаты и бульон, варите 20 минут.",
      "Пробейте суп блендером, добавьте базилик и подавайте.",
    ],
  },
  {
    id: "berry-pancakes",
    title: "Пышные панкейки с ягодами",
    description: "Нежные панкейки с сезонными ягодами и каплей мёда.",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=85",
    minutes: 25,
    rating: 5,
    source: "user",
    servings: 3,
    ingredients: [
      { name: "Мука", measure: "200 г" },
      { name: "Молоко", measure: "250 мл" },
      { name: "Яйцо", measure: "1 шт." },
      { name: "Ягоды", measure: "150 г" },
    ],
    steps: [
      "Смешайте муку, молоко, яйцо и разрыхлитель до однородности.",
      "Жарьте небольшие панкейки на среднем огне по 2 минуты с каждой стороны.",
      "Подавайте с ягодами и мёдом.",
    ],
  },
];
