import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const recipes = pgTable("recipes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  ingredients: text("ingredients").notNull(),
  instructions: text("instructions").notNull(),
  cookingTime: integer("cooking_time").notNull(),
  servings: integer("servings").notNull(),
  tags: text("tags").array().notNull(),
  photoUrl: text("photo_url"),
  dateCreated: timestamp("date_created").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
}));

export const recipesRelations = relations(recipes, ({ one }) => ({
  owner: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
}));
