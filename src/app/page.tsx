import { RecipeBrowser } from "@/components/RecipeBrowser";

type HomeProps = {
  searchParams: Promise<{
    search?: string;
    tag?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  return <RecipeBrowser initialSearch={params.search ?? ""} initialTag={params.tag ?? ""} />;
}
