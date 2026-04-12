import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { ListingFormData } from "@/types";
import { MAPLE_SERVERS } from "../constants";
import { Button, Input, Textarea, Select } from "@/components/ui";
import { ItemSearch } from "./ItemSearch";
import { useListingForm, statFields } from "../hooks/useListingForm";
import { getItemIconUrl } from "@/services";
import { getItemRequirementLabel } from "../utils/itemDisplay";
import toast from "react-hot-toast";

interface ListingFormProps {
  initialData?: ListingFormData;
  onSubmit: (data: ListingFormData, listingImageFile?: File | null, removeListingImage?: boolean) => void;
  loading?: boolean;
  submitLabel?: string;
}

const serverOptions = MAPLE_SERVERS.map((s) => ({ value: s, label: s }));
const MAX_LISTING_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_LISTING_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ListingForm = ({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Create Listing",
}: ListingFormProps) => {
  const {
    form,
    selectedItem,
    activeStats,
    availableStats,
    update,
    updateStat,
    addStat,
    removeStat,
    handleItemSelect,
    handleItemClear,
  } = useListingForm(initialData, onSubmit);
  const [listingImageFile, setListingImageFile] = useState<File | null>(null);
  const [listingImagePreviewUrl, setListingImagePreviewUrl] = useState(initialData?.listingImageUrl ?? "");
  const [removeListingImage, setRemoveListingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const requirementLabel = selectedItem
    ? getItemRequirementLabel({
        name: selectedItem.name,
        requiredLevel: selectedItem.requiredLevel,
        overallCategory: selectedItem.typeInfo.overallCategory,
        category: selectedItem.typeInfo.category,
        subCategory: selectedItem.typeInfo.subCategory,
      })
    : null;
  const hasListingImage = useMemo(
    () => !!listingImagePreviewUrl && !removeListingImage,
    [listingImagePreviewUrl, removeListingImage]
  );

  useEffect(() => {
    setListingImagePreviewUrl(initialData?.listingImageUrl ?? "");
  }, [initialData?.listingImageUrl]);

  useEffect(() => () => {
    if (listingImagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(listingImagePreviewUrl);
    }
  }, [listingImagePreviewUrl]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_LISTING_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP screenshots are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_LISTING_IMAGE_SIZE_BYTES) {
      toast.error("Screenshot must be 2MB or smaller.");
      e.target.value = "";
      return;
    }

    if (listingImagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(listingImagePreviewUrl);
    }

    setListingImageFile(file);
    setRemoveListingImage(false);
    setListingImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (listingImagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(listingImagePreviewUrl);
    }

    setListingImageFile(null);
    setListingImagePreviewUrl("");
    setRemoveListingImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.itemId) return;

    onSubmit(
      {
        ...form,
        listingImageUrl: removeListingImage ? undefined : form.listingImageUrl,
        listingImagePath: removeListingImage ? undefined : form.listingImagePath,
      },
      listingImageFile,
      removeListingImage
    );
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Step 1: Item Search */}
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🔍 Find Your Item
        </h3>
        <p className="text-slate-400 text-sm mt-1">Search for a MapleStory item by name</p>
      </div>

      <ItemSearch
        onSelect={handleItemSelect}
        onClear={handleItemClear}
        selectedItem={selectedItem}
      />

      {/* Rest of form only visible after item selection */}
      {selectedItem && (
        <>
          {/* Item Info Card */}
          <div className="bg-slate-800/50 border border-maple-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <img
                src={getItemIconUrl(selectedItem.id)}
                alt={selectedItem.name}
                className="w-16 h-16 object-contain"
              />
              <div>
                <h4 className="text-white font-bold text-lg">{selectedItem.name}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-maple-orange/20 text-maple-orange">
                    {selectedItem.typeInfo.overallCategory}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    {selectedItem.typeInfo.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    {selectedItem.typeInfo.subCategory}
                  </span>
                  {requirementLabel && (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                      {requirementLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Listing Details */}
          <div>
            <h3 className="text-lg font-semibold text-white">💰 Listing Details</h3>
          </div>

          <div className="space-y-3 rounded-xl border border-maple-border bg-slate-800/40 p-4">
            <div>
              <h3 className="text-lg font-semibold text-white">🖼️ Optional Item Screenshot</h3>
              <p className="mt-1 text-sm text-slate-400">
                This screenshot only loads on the listing page. Preview cards just show a tag if it exists.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-maple-orange file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-maple-orange-dark"
            />
            <p className="text-xs text-slate-500">Accepted: JPG, PNG, WEBP. Max 2MB.</p>
            {hasListingImage && (
              <div className="space-y-3">
                <img
                  src={listingImagePreviewUrl}
                  alt="Listing screenshot preview"
                  className="max-h-72 w-full rounded-xl border border-maple-border object-contain bg-slate-900/70"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleRemoveImage}>
                  Remove Screenshot
                </Button>
              </div>
            )}
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Any extra info about this item..."
            rows={3}
          />

          <Input
            label="Price (Mesos)"
            type="number"
            value={form.price || ""}
            onChange={(e) => {
              let value = Number(e.target.value);
              if (isNaN(value)) value = 0;
              if (value < 0) value = 0;
              if (value > 2147483647) value = 2147483647;
              update("price", value);
            }}
            placeholder="1,000,000"
            min={0}
            max={2147483647}
            required
          />

          {/* Amount – non-Equip only */}
          {form.overallCategory && form.overallCategory !== "Equip" && (
            <Input
              label="Amount"
              type="number"
              value={form.amount || ""}
              onChange={(e) => {
                let value = Number(e.target.value);
                if (isNaN(value)) value = 1;
                if (value < 1) value = 1;
                if (value > 9999) value = 9999;
                update("amount", value);
              }}
              placeholder="1"
              min={1}
              max={9999}
            />
          )}

          <Select
            label="Server"
            value={form.server}
            onChange={(e) => update("server", e.target.value)}
            options={serverOptions}
            disabled
          />

          {/* Store Info */}
          <div>
            <h3 className="text-lg font-semibold text-white">🏪 Store Info</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Is now in store?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => update("isInStore", true)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  form.isInStore
                    ? "bg-maple-orange/20 border-maple-orange text-maple-orange"
                    : "bg-slate-800 border-maple-border text-slate-400 hover:border-slate-500"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => update("isInStore", false)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  !form.isInStore
                    ? "bg-maple-orange/20 border-maple-orange text-maple-orange"
                    : "bg-slate-800 border-maple-border text-slate-400 hover:border-slate-500"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {form.isInStore && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-3 border-l-2 border-maple-orange/30">
              <Input
                label="Store Channel"
                type="number"
                value={form.storeChannel || ""}
                onChange={(e) => update("storeChannel", Number(e.target.value))}
                placeholder="e.g. 1"
                min={1}
              />
              <Input
                label="FM Room"
                type="number"
                value={form.fmRoom || ""}
                onChange={(e) => update("fmRoom", Number(e.target.value))}
                placeholder="e.g. 1"
                min={1}
              />
              <Input
                label="Seller IGN"
                value={form.sellerIgn || ""}
                onChange={(e) => update("sellerIgn", e.target.value)}
                placeholder="In-game name"
              />
            </div>
          )}

          {/* Condition – Equip only */}
          {form.overallCategory === "Equip" && (
          <div>
            <h3 className="text-lg font-semibold text-white">📜 Item Condition</h3>
          </div>
          )}

          {form.overallCategory === "Equip" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Scrolled / Clean
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => update("condition", "clean")}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  form.condition === "clean"
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : "bg-slate-800 border-maple-border text-slate-400 hover:border-slate-500"
                }`}
              >
                🧼 Clean
              </button>
              <button
                type="button"
                onClick={() => update("condition", "scrolled")}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  form.condition === "scrolled"
                    ? "bg-purple-500/20 border-purple-500 text-purple-400"
                    : "bg-slate-800 border-maple-border text-slate-400 hover:border-slate-500"
                }`}
              >
                ✨ Scrolled
              </button>
            </div>
          </div>
          )}

          {/* Stats (Optional) – Equip only */}
          {form.overallCategory === "Equip" && (
          <>
          <div>
            <h3 className="text-lg font-semibold text-white">⚔️ Item Stats <span className="text-sm font-normal text-slate-400">(optional)</span></h3>
            <p className="text-slate-400 text-sm mt-1">Add only the stats that matter for your item</p>
          </div>

          {activeStats.length > 0 && (
            <div className="space-y-2">
              {activeStats.map((key) => {
                const field = statFields.find((sf) => sf.key === key)!;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        label={field.label}
                        type="number"
                        value={form.stats[key] || ""}
                        onChange={(e) => updateStat(key, Number(e.target.value))}
                        placeholder="0"
                        min={0}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStat(key)}
                      className="mt-5 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove stat"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {availableStats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableStats.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => addStat(key)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-maple-border text-slate-400 hover:border-maple-orange hover:text-maple-orange hover:bg-maple-orange/10 transition-all"
                >
                  + {label}
                </button>
              ))}
            </div>
          )}
          </>
          )}

          <Button type="submit" loading={loading} className="w-full">
            {submitLabel}
          </Button>
        </>
      )}
    </form>
  );
};
