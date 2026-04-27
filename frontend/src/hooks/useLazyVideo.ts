import { useEffect, useRef, useState } from "react";

export type Visibility = "offscreen" | "near" | "visible";

type Entry = {
  setState: React.Dispatch<React.SetStateAction<Visibility>>;
};

const nearEntries = new Map<Element, Entry>();
const visibleEntries = new Map<Element, Entry>();

const nearObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const rec = nearEntries.get(entry.target);
      if (!rec) continue;
      if (entry.isIntersecting) {
        rec.setState((v) => (v === "offscreen" ? "near" : v));
      } else {
        rec.setState("offscreen");
      }
    }
  },
  { rootMargin: "400px" },
);

const visibleObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const rec = visibleEntries.get(entry.target);
      if (!rec) continue;
      if (entry.isIntersecting) {
        rec.setState("visible");
      } else {
        rec.setState((v) => (v === "visible" ? "near" : v));
      }
    }
  },
  { rootMargin: "50px" },
);

export function useLazyVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState<Visibility>("offscreen");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const entry: Entry = { setState: setVisibility };
    nearEntries.set(el, entry);
    visibleEntries.set(el, entry);
    nearObserver.observe(el);
    visibleObserver.observe(el);

    return () => {
      nearObserver.unobserve(el);
      visibleObserver.unobserve(el);
      nearEntries.delete(el);
      visibleEntries.delete(el);
    };
  }, []);

  return { containerRef, visibility };
}
