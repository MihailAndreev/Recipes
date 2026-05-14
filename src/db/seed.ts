import "dotenv/config";

import bcrypt from "bcrypt";
import { inArray } from "drizzle-orm";

import { db } from "./index";
import { recipes, users } from "./schema";

const sampleUsers = [
  {
    email: "ivan@abv.bg",
    password: "123456",
    recipes: [
      {
        title: "Shopska Salad",
        description: "A bright Bulgarian salad with tomatoes, cucumbers, peppers, and sirene.",
        ingredients: "tomatoes, cucumber, roasted pepper, red onion, parsley, sirene cheese, sunflower oil, salt",
        instructions: "Chop the vegetables, toss with oil and salt, then finish with grated sirene and parsley.",
        cookingTime: 15,
        servings: 4,
        tags: ["salad", "bulgarian", "vegetarian"],
      },
      {
        title: "Chicken Kavarma",
        description: "Slow-cooked chicken with peppers, onions, tomatoes, and savory herbs.",
        ingredients: "chicken thighs, onion, peppers, tomatoes, mushrooms, paprika, savory, parsley, oil, salt",
        instructions: "Brown the chicken, add vegetables and spices, then simmer until tender and saucy.",
        cookingTime: 55,
        servings: 4,
        tags: ["chicken", "stew", "bulgarian"],
      },
      {
        title: "Lentil Soup",
        description: "Comforting lentil soup with carrots, garlic, tomato, and cumin.",
        ingredients: "brown lentils, carrot, onion, garlic, tomato puree, cumin, paprika, oil, salt, parsley",
        instructions: "Saute the vegetables, add lentils and water, simmer until soft, and season to taste.",
        cookingTime: 45,
        servings: 6,
        tags: ["soup", "vegetarian", "easy"],
      },
      {
        title: "Banitsa",
        description: "Crisp filo pastry filled with eggs, yogurt, and white cheese.",
        ingredients: "filo pastry, eggs, yogurt, sirene cheese, butter, baking soda",
        instructions: "Mix the filling, layer with buttered filo sheets, roll or stack, then bake until golden.",
        cookingTime: 50,
        servings: 8,
        tags: ["breakfast", "pastry", "bulgarian"],
      },
      {
        title: "Grilled Pork Skewers",
        description: "Juicy pork skewers marinated with onion, paprika, and herbs.",
        ingredients: "pork shoulder, onion, paprika, black pepper, savory, oil, lemon juice, salt",
        instructions: "Marinate cubed pork, thread onto skewers, and grill until browned and cooked through.",
        cookingTime: 35,
        servings: 4,
        tags: ["grill", "pork", "dinner"],
      },
    ],
  },
  {
    email: "go6o@abv.bg",
    password: "123456",
    recipes: [
      {
        title: "Mish-Mash",
        description: "Quick eggs scrambled with peppers, tomatoes, onion, and sirene.",
        ingredients: "eggs, roasted peppers, tomatoes, onion, sirene cheese, parsley, oil, salt",
        instructions: "Cook onion and peppers, add tomatoes, scramble in eggs, and fold in cheese.",
        cookingTime: 25,
        servings: 3,
        tags: ["eggs", "quick", "vegetarian"],
      },
      {
        title: "Stuffed Peppers",
        description: "Peppers filled with rice, minced meat, tomato, and herbs.",
        ingredients: "bell peppers, minced pork, rice, onion, tomato puree, paprika, savory, oil, salt",
        instructions: "Prepare the rice and meat filling, stuff peppers, add tomato sauce, and bake until tender.",
        cookingTime: 75,
        servings: 6,
        tags: ["baked", "pork", "family"],
      },
      {
        title: "Tarator",
        description: "Cold yogurt soup with cucumber, dill, garlic, and walnuts.",
        ingredients: "yogurt, cucumber, garlic, dill, walnuts, water, sunflower oil, salt",
        instructions: "Grate cucumber, mix with yogurt and water, then add garlic, dill, walnuts, oil, and salt.",
        cookingTime: 10,
        servings: 4,
        tags: ["soup", "cold", "summer"],
      },
      {
        title: "Moussaka",
        description: "Baked potatoes and minced meat topped with a yogurt and egg custard.",
        ingredients: "potatoes, minced beef, onion, tomato, paprika, savory, eggs, yogurt, flour, oil, salt",
        instructions: "Cook the meat base, combine with potatoes, bake, add topping, and bake again until set.",
        cookingTime: 80,
        servings: 6,
        tags: ["baked", "beef", "comfort"],
      },
      {
        title: "Rice Pudding",
        description: "Creamy rice pudding scented with vanilla and cinnamon.",
        ingredients: "short-grain rice, milk, sugar, vanilla, cinnamon, salt",
        instructions: "Simmer rice in milk with sugar and vanilla until creamy, then serve with cinnamon.",
        cookingTime: 40,
        servings: 5,
        tags: ["dessert", "rice", "simple"],
      },
    ],
  },
];

async function seed() {
  const insertedUsers = [];

  for (const sampleUser of sampleUsers) {
    const hashedPassword = await bcrypt.hash(sampleUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        email: sampleUser.email,
        password: hashedPassword,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          password: hashedPassword,
        },
      })
      .returning();

    insertedUsers.push({ ...user, recipes: sampleUser.recipes });
  }

  const userIds = insertedUsers.map((user) => user.id);
  await db.delete(recipes).where(inArray(recipes.userId, userIds));

  for (const user of insertedUsers) {
    await db.insert(recipes).values(
      user.recipes.map((recipe) => ({
        ...recipe,
        userId: user.id,
      })),
    );
  }

  const recipeCount = insertedUsers.reduce((count, user) => count + user.recipes.length, 0);
  console.log(`Seeded ${insertedUsers.length} users and ${recipeCount} recipes.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
