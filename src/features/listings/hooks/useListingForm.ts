import { useState, useCallback, useMemo, type FormEvent } from "react";
import type { ListingFormData, MapleItemResult, ItemStats } from "@/types";
import { MAPLE_SERVERS } from "../constants";
import { getItemIconUrl } from "@/services/maplestory.service";
import { getScrollSuccessRate } from "../utils/itemDisplay";

const defaultStats: ItemStats = {
  str: 0, dex: 0, int: 0, luk: 0,
  wepAtt: 0, wepMagicAtt: 0, wepDef: 0, wepMDef: 0,
  hp: 0, mp: 0, acc: 0, avoid: 0, availableSlots: 0,
};

const defaultData: ListingFormData = {
  itemId: 0,
  itemName: "",
  itemIconUrl: "",
  overallCategory: "",
  category: "",
  subCategory: "",
  requiredLevel: 0,
  scrollSuccessRate: undefined,
  amount: undefined,
  description: "",
  price: 0,
  server: MAPLE_SERVERS[0],
  isInStore: false,
  condition: "clean",
  stats: { ...defaultStats },
};

export const statFields: { key: keyof ItemStats; label: string }[] = [
  { key: "str", label: "STR +" },
  { key: "dex", label: "DEX +" },
  { key: "int", label: "INT +" },
  { key: "luk", label: "LUK +" },
  { key: "wepAtt", label: "Weapon ATT +" },
  { key: "wepMagicAtt", label: "Weapon Magic ATT +" },
  { key: "wepDef", label: "Weapon DEF +" },
  { key: "wepMDef", label: "Weapon M.DEF +" },
  { key: "hp", label: "HP +" },
  { key: "mp", label: "MP +" },
  { key: "acc", label: "Accuracy +" },
  { key: "avoid", label: "Avoidability +" },
  { key: "availableSlots", label: "Available Slots" },
];

export const useListingForm = (
  initialData: ListingFormData | undefined,
  onSubmit: (data: ListingFormData) => void
) => {
  const [form, setForm] = useState<ListingFormData>(initialData ?? defaultData);
  const [selectedItem, setSelectedItem] = useState<MapleItemResult | null>(
    initialData?.itemId
      ? {
          id: initialData.itemId,
          name: initialData.itemName,
          desc: "",
          requiredJobs: [],
          requiredLevel: initialData.requiredLevel,
          isCash: false,
          requiredGender: 2,
          typeInfo: {
            overallCategory: initialData.overallCategory,
            category: initialData.category,
            subCategory: initialData.subCategory,
            lowItemId: 0,
            highItemId: 0,
          },
        }
      : null
  );

  const [activeStats, setActiveStats] = useState<(keyof ItemStats)[]>(
    initialData
      ? (Object.entries(initialData.stats)
          .filter(([k, v]) => v > 0 || k === "availableSlots")
          .map(([k]) => k) as (keyof ItemStats)[])
      : []
  );

  const update = useCallback(
    (field: keyof ListingFormData, value: string | number | boolean) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    []
  );

  const updateStat = useCallback(
    (key: keyof ItemStats, value: number) =>
      setForm((prev) => ({ ...prev, stats: { ...prev.stats, [key]: value } })),
    []
  );

  const availableStats = useMemo(
    () => statFields.filter((sf) => !activeStats.includes(sf.key)),
    [activeStats]
  );

  const addStat = useCallback((key: keyof ItemStats) => {
    setActiveStats((prev) => [...prev, key]);
  }, []);

  const removeStat = useCallback(
    (key: keyof ItemStats) => {
      setActiveStats((prev) => prev.filter((k) => k !== key));
      updateStat(key, 0);
    },
    [updateStat]
  );

  const handleItemSelect = useCallback((item: MapleItemResult) => {
    setSelectedItem(item);
    const rate = getScrollSuccessRate(item.desc ?? "");
    const isEquip = item.typeInfo.overallCategory === "Equip";
    setForm((prev) => ({
      ...prev,
      itemId: item.id,
      itemName: item.name,
      itemIconUrl: getItemIconUrl(item.id),
      overallCategory: item.typeInfo.overallCategory,
      category: item.typeInfo.category,
      subCategory: item.typeInfo.subCategory,
      requiredLevel: item.requiredLevel,
      scrollSuccessRate: rate ? parseInt(rate) : undefined,
      amount: isEquip ? undefined : (prev.amount ?? 1),
    }));
  }, []);

  const handleItemClear = useCallback(() => {
    setSelectedItem(null);
    setForm((prev) => ({
      ...prev,
      itemId: 0,
      itemName: "",
      itemIconUrl: "",
      overallCategory: "",
      category: "",
      subCategory: "",
      requiredLevel: 0,
      scrollSuccessRate: undefined,
      amount: undefined,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!form.itemId) return;
      onSubmit(form);
    },
    [form, onSubmit]
  );

  return {
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
    handleSubmit,
  };
}
