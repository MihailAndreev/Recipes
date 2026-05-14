import { RecipeDetail } from "@/components/RecipeDetail";

type RecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;

  return <RecipeDetail id={Number(id)} />;
}
