import { parseRecipeId, parseRecipeInput } from "./recipes";

const validRecipeInput = {
  title: "Tomato Pasta",
  description: "Quick pasta",
  ingredients: "pasta, tomatoes, garlic",
  instructions: "Boil pasta and combine with sauce.",
  cookingTime: 30,
  servings: 4,
  tags: ["Pasta", "Vegetarian"],
};

describe("recipe validation", () => {
  it("parses valid recipe input", () => {
    const result = parseRecipeInput(validRecipeInput);

    expect(result.errors).toEqual([]);
    expect(result.data).toEqual({
      ...validRecipeInput,
      tags: ["pasta", "vegetarian"],
    });
  });

  it("supports snake_case cooking_time and optional photo_url", () => {
    const result = parseRecipeInput({
      ...validRecipeInput,
      cookingTime: undefined,
      cooking_time: "45",
      photo_url: "https://example.com/photo.jpg",
    });

    expect(result.errors).toEqual([]);
    expect(result.data.cookingTime).toBe(45);
    expect(result.data.photoUrl).toBe("https://example.com/photo.jpg");
  });

  it("returns errors for missing required fields", () => {
    const result = parseRecipeInput({
      title: "",
      ingredients: "",
      instructions: "",
      cookingTime: 0,
      servings: "nope",
      tags: ["valid", 123],
    });

    expect(result.errors).toEqual([
      "title is required.",
      "ingredients is required.",
      "instructions is required.",
      "cookingTime must be a positive integer.",
      "servings must be a positive integer.",
      "tags must be an array of strings.",
    ]);
  });

  it("allows partial update input with at least one field", () => {
    const result = parseRecipeInput({ title: "Updated title" }, true);

    expect(result.errors).toEqual([]);
    expect(result.data).toEqual({ title: "Updated title" });
  });

  it("rejects empty partial update input", () => {
    const result = parseRecipeInput({}, true);

    expect(result.errors).toEqual(["At least one recipe field is required."]);
  });

  it("parses positive integer route ids", () => {
    expect(parseRecipeId({ id: "12" })).toBe(12);
    expect(parseRecipeId({ id: "0" })).toBeNull();
    expect(parseRecipeId({ id: "abc" })).toBeNull();
  });
});
