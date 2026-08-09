import { useId } from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "react-tooltip";

interface TruncatedTextProps {
  text: string;
  as?: "p" | "span" | "h3" | "h4";
  className?: string;
  place?: "top" | "bottom" | "left" | "right";
  /** Clamp to N lines instead of a single truncated line. */
  lineClamp?: 2 | 3;
}

const TOOLTIP_CLASSNAME =
  "!bg-slate-800 !text-white !text-xs !font-medium !rounded-lg !px-3 !py-1.5 !shadow-xl !border !border-maple-border !z-[9999]";

/** Renders text that's truncated/clamped, with a tooltip revealing the full value on hover. */
export const TruncatedText = ({
  text,
  as = "span",
  className = "",
  place = "top",
  lineClamp,
}: TruncatedTextProps) => {
  const id = useId();
  const Tag = as;
  const clampClass = lineClamp === 2 ? "line-clamp-2" : lineClamp === 3 ? "line-clamp-3" : "truncate";

  return (
    <>
      <Tag
        className={`${clampClass} ${className}`.trim()}
        data-tooltip-id={id}
        data-tooltip-content={text}
      >
        {text}
      </Tag>
      {createPortal(
        // Portaled to escape clipping ancestors — react-tooltip renders
        // inline with position:absolute, so a card with overflow-hidden
        // (or a hover transform, which creates a new containing block)
        // would otherwise crop the tooltip away entirely.
        <Tooltip id={id} place={place} className={TOOLTIP_CLASSNAME} opacity={1} delayShow={300} offset={8} />,
        document.body
      )}
    </>
  );
};
