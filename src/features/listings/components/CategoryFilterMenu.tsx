import { useState } from "react";
import type { CategoryFilterKey, CategoryFilterOption } from "../hooks/useListingsPage";

interface CategoryFilterMenuProps {
  groups: { label: string; options: CategoryFilterOption[] }[];
  selected: Set<CategoryFilterKey>;
  onToggle: (key: CategoryFilterKey) => void;
}

const Chevron = ({ expanded }: { expanded: boolean }) => (
  <svg
    className={`w-3 h-3 flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export const CategoryFilterMenu = ({ groups, selected, onToggle }: CategoryFilterMenuProps) => {
  // Groups collapsed by default except the first (shortest lists stay open,
  // "Equip" — the long one — starts collapsed to keep the panel short).
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(groups.slice(1).map((g) => g.label))
  );

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto rounded-xl border border-maple-border bg-maple-card shadow-2xl z-20 p-1.5">
      {groups.map((group) => {
        const groupExpanded = expanded.has(group.label);
        return (
          <div key={group.label} className="mb-1">
            <button
              type="button"
              onClick={() => toggleExpanded(group.label)}
              className="w-full flex items-center gap-1.5 px-2 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-200 transition-colors"
            >
              <Chevron expanded={groupExpanded} />
              {group.label}
            </button>
            {groupExpanded &&
              group.options.map((option) => (
                <CategoryFilterRow
                  key={option.value}
                  option={option}
                  depth={1}
                  selected={selected}
                  onToggle={onToggle}
                  expanded={expanded}
                  toggleExpanded={toggleExpanded}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
};

interface CategoryFilterRowProps {
  option: CategoryFilterOption;
  depth: number;
  selected: Set<CategoryFilterKey>;
  onToggle: (key: CategoryFilterKey) => void;
  expanded: Set<string>;
  toggleExpanded: (key: string) => void;
}

const CategoryFilterRow = ({
  option,
  depth,
  selected,
  onToggle,
  expanded,
  toggleExpanded,
}: CategoryFilterRowProps) => {
  const hasChildren = !!option.children?.length;
  const isExpanded = expanded.has(option.value);

  return (
    <div>
      <div className="flex items-center gap-1" style={{ paddingLeft: depth * 12 }}>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggleExpanded(option.value)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            aria-label={isExpanded ? `Collapse ${option.label}` : `Expand ${option.label}`}
          >
            <Chevron expanded={isExpanded} />
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}
        <label className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-slate-200 hover:bg-slate-700/70 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={selected.has(option.value)}
            onChange={() => onToggle(option.value)}
            className="accent-maple-orange"
          />
          {option.label}
        </label>
      </div>
      {hasChildren &&
        isExpanded &&
        option.children!.map((child) => (
          <CategoryFilterRow
            key={child.value}
            option={child}
            depth={depth + 1}
            selected={selected}
            onToggle={onToggle}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
          />
        ))}
    </div>
  );
};
