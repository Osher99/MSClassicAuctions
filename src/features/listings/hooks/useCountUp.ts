import { useEffect, useState } from "react";

/** Animates from 0 to `target` while `active`, using an ease-out curve. */
export const useCountUp = (target: number, active: boolean, durationMs = 1500): number => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let startTime: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs]);

  return value;
};
