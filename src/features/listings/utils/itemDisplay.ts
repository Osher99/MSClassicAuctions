interface ItemDisplayInput {
  name: string;
  requiredLevel: number;
  overallCategory?: string;
  category?: string;
  subCategory?: string;
  desc?: string;
  scrollSuccessRate?: number;
}

const PERCENTAGE_PATTERN = /(\d+)%/;
const DESC_SUCCESS_RATE_PATTERN = /[Ss]uccess\s*[Rr]ate\s*:?\s*(\d+)%/;

export const getScrollSuccessRate = (desc: string): string | null => {
  const match = desc.match(DESC_SUCCESS_RATE_PATTERN);
  return match ? `${match[1]}%` : null;
};

export const getItemRequirementLabel = ({
  name,
  requiredLevel,
  overallCategory = "",
  category = "",
  subCategory = "",
  desc = "",
  scrollSuccessRate,
}: ItemDisplayInput) => {
  const normalizedCategories = [overallCategory, category, subCategory].join(" ").toLowerCase();
  const isUseItem = normalizedCategories.includes("use") || normalizedCategories.includes("scroll");

  if (isUseItem) {
    // Use stored rate first, then try desc, then name
    if (scrollSuccessRate != null) return `${scrollSuccessRate}%`;
    const descRate = getScrollSuccessRate(desc);
    if (descRate) return descRate;
    const nameMatch = name.match(PERCENTAGE_PATTERN);
    if (nameMatch) return nameMatch[0];
    return null;
  }

  if (!Number.isFinite(requiredLevel) || requiredLevel <= 0) {
    return null;
  }

  return `Lv. ${requiredLevel}`;
};