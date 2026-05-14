import { EditRecipePage } from "@/components/EditRecipePage";

type EditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;

  return <EditRecipePage id={Number(id)} />;
}
