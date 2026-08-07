import { useState, useEffect, useRef } from "react";
import { searchItems } from "@/services";
import type { MapleItemResult } from "@/types";

/**
 * Debounce-free item-name search with an open/closed dropdown and
 * click-outside-to-close behavior. Shared by ItemSearch (listing
 * creation) and the Wishlist page's "add an item" search.
 */
export const useItemSearchDropdown = (minChars = 2) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapleItemResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < minChars) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    searchItems(query)
      .then((items) => {
        if (cancelled) return;
        setResults(items);
        setIsOpen(true);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, minChars]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const reset = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return { query, setQuery, results, isOpen, setIsOpen, loading, wrapperRef, reset };
};
