import { useEffect, useState } from "react";

export default function useCountUp(target, ms = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return undefined;
    }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / ms, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}
