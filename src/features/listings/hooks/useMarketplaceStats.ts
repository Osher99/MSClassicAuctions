import { useEffect, useRef, useState } from "react";
import { getMarketplaceStats } from "@/services";
import type { MarketplaceStats } from "@/services";

/** Fetches marketplace stats and reports once the given ref scrolls into view. */
export const useMarketplaceStats = () => {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMarketplaceStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { stats, inView, sectionRef };
};
