import { useEditListingPage } from "../hooks/useEditListingPage";
import { ListingForm } from "../components/ListingForm";
import { Spinner, Card, PageHeader, EmptyState } from "@/components/ui";

export const EditListingPage = () => {
  const { listing, isLoading, isOwner, initialData, handleSubmit, isPending } =
    useEditListingPage();

  if (isLoading) return <Spinner />;

  if (!listing || !isOwner) {
    return (
      <EmptyState
        icon="🔒"
        title="Listing not found"
        subtitle="This listing doesn't exist or you don't have permission to edit it."
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="✏️ Edit Listing" subtitle="Update your item listing" />
      <Card>
        <ListingForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={isPending}
          submitLabel="Save Changes"
        />
      </Card>
    </div>
  );
}
