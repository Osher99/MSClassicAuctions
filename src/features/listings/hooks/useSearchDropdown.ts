import { useState, useEffect, useRef } from "react";

/**
 * Debounce-free name search with an open/closed dropdown and
 * click-outside-to-close behavior. `searchFn` must be a stable reference
 * (a plain exported function, not an inline lambda) since it's a
 * dependency of the search effect.
 *
 * Shared by ItemSearch (listing creation), the Wishlist page's "add an
 * item" search, and the "specific map" picker in ListingForm.
 */
export const useSearchDropdown = <T>(searchFn: (query: string) => Promise<T[]>, minChars = 2) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
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
    searchFn(query)
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
  }, [query, minChars, searchFn]);

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
