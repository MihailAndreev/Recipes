export type User = {
  id: number;
  email: string;
  isAdmin: boolean;
};

export type Recipe = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  cookingTime: number;
  servings: number;
  tags: string[];
  photoUrl: string | null;
  dateCreated: string;
};

export type RecipePayload = {
  title: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  cookingTime: number;
  servings: number;
  tags: string[];
  photoUrl?: string | null;
};

export type Paging = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
