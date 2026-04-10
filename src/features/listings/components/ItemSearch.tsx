import { useState, useEffect, useRef } from "react";
import { searchItems, getItemIconUrl } from "@/services/maplestory.service";
import type { MapleItemResult } from "@/types";
import { getItemRequirementLabel } from "../utils/itemDisplay";

interface ItemSearchProps {
  onSelect: (item: MapleItemResult) => void;
  onClear: () => void;
  selectedItem: MapleItemResult | null;
}

export const ItemSearch = ({ onSelect, onClear, selectedItem }: ItemSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapleItemResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const selectedRequirementLabel = selectedItem
    ? getItemRequirementLabel({
        name: selectedItem.name,
        requiredLevel: selectedItem.requiredLevel,
        overallCategory: selectedItem.typeInfo.overallCategory,
        category: selectedItem.typeInfo.category,
        subCategory: selectedItem.typeInfo.subCategory,
        desc: selectedItem.desc,
      })
    : null;

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const items = await searchItems(query);
        setResults(items);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: MapleItemResult) => {
    onSelect(item);
    setQuery(item.name);
    setIsOpen(false);
  };

  // Show selected item card
  if (selectedItem) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Selected Item</label>
        <div className="flex items-center gap-3 p-3 bg-slate-800 border border-maple-border rounded-lg">
          <img
            src={getItemIconUrl(selectedItem.id)}
            alt={selectedItem.name}
            className="w-10 h-10 object-contain"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{selectedItem.name}</p>
            <p className="text-slate-400 text-xs">
              {selectedItem.typeInfo.category} &middot; {selectedItem.typeInfo.subCategory}
              {selectedRequirementLabel ? ` · ${selectedRequirementLabel}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClear();
              setQuery("");
            }}
            className="text-slate-400 hover:text-red-400 transition-colors text-sm"
          >
            ✕ Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        Search Item
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type at least 3 characters to search..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-maple-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-maple-orange/50 focus:border-maple-orange transition-all"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-maple-orange text-sm animate-pulse">
            Searching...
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-72 overflow-y-auto bg-slate-800 border border-maple-border rounded-lg shadow-xl">
          {results.slice(0, 50).map((item) => (
            (() => {
              const requirementLabel = getItemRequirementLabel({
                name: item.name,
                requiredLevel: item.requiredLevel,
                overallCategory: item.typeInfo.overallCategory,
                category: item.typeInfo.category,
                subCategory: item.typeInfo.subCategory,
                desc: item.desc,
              });

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors text-left"
                >
                  <img
                    src={getItemIconUrl(item.id)}
                    alt={item.name}
                    className="w-8 h-8 object-contain flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-slate-400 text-xs truncate">
                      {item.typeInfo.category} &middot; {item.typeInfo.subCategory}
                      {requirementLabel ? ` · ${requirementLabel}` : ""}
                    </p>
                  </div>
                </button>
              );
            })()
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && !loading && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-maple-border rounded-lg p-3 text-slate-400 text-sm text-center">
          No items found
        </div>
      )}
    </div>
  );
};
