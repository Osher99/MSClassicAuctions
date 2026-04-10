import { useCreateListingPage } from "../hooks/useCreateListingPage";
import { ListingForm } from "../components/ListingForm";
import { Card, PageHeader } from "@/components/ui";

export const CreateListingPage = () => {
  const { handleSubmit, isPending } = useCreateListingPage();

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="📦 Create Listing"
        subtitle="List your MapleStory item for sale"
      />
      <Card>
        <ListingForm onSubmit={handleSubmit} loading={isPending} />
      </Card>
    </div>
  );
}
