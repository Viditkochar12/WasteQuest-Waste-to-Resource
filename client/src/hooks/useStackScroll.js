import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Custom hook implementing the Card Stacking Motion specification:
 * - rAF-throttled passive scroll listener
 * - Calculates entering factor q and covered factor p
 * - Updates transform, scale, opacity, and overlay opacity
 * - Applies hysteresis for the 'in' class (add at q > 0.75, remove at q < 0.3)
 * - Seamlessly handles forward and reverse scroll
 */
export function useStackScroll(cardCount) {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const inStatesRef = useRef(new Array(cardCount).fill(false));

  useEffect(() => {
    if (prefersReducedMotion) return;

    let rafId = null;
    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    const updateStacking = () => {
      const container = containerRef.current;
      if (!container) return;

      const cardEls = container.querySelectorAll(".stack-card");
      if (!cardEls || cardEls.length === 0) return;

      const vh = window.innerHeight;
      const isMobile = window.innerWidth <= 768;
      const baseStickyTop = isMobile ? 64 : 72;
      const stepStickyTop = isMobile ? 9 : 12;

      let highestActiveIndex = 0;

      for (let i = 0; i < cardEls.length; i++) {
        const cardEl = cardEls[i];
        const rect = cardEl.getBoundingClientRect();
        const stickyTop = baseStickyTop + i * stepStickyTop;

        // 1. Entering calculation: q = clamp((viewportHeight - card.top) / (0.45 * viewportHeight), 0, 1)
        const q = clamp((vh - rect.top) / (0.45 * vh), 0, 1);
        let scale = 0.93 + 0.07 * q;
        let opacity = 0.5 + 0.5 * q;

        // 2. Covered calculation: check next card position
        let overlayOpacity = 0;
        if (i < cardEls.length - 1) {
          const nextCardEl = cardEls[i + 1];
          if (nextCardEl) {
            const nextRect = nextCardEl.getBoundingClientRect();
            // p = clamp(1 - (nextCard.top - stickyTop) / (0.7 * viewportHeight), 0, 1)
            const p = clamp(1 - (nextRect.top - stickyTop) / (0.7 * vh), 0, 1);
            scale *= (1 - 0.05 * p);
            overlayOpacity = 0.5 * p;
          }
        }

        // Apply transforms on compositor
        cardEl.style.transform = `scale(${scale.toFixed(4)})`;
        cardEl.style.opacity = opacity.toFixed(4);
        cardEl.style.setProperty("--overlay-opacity", overlayOpacity.toFixed(3));

        // 3. Hysteresis for .in class: add at q > 0.75, remove at q < 0.3
        const wasIn = inStatesRef.current[i];
        let isIn = wasIn;
        if (!wasIn && q > 0.75) {
          isIn = true;
        } else if (wasIn && q < 0.3) {
          isIn = false;
        }

        if (isIn !== wasIn) {
          inStatesRef.current[i] = isIn;
          if (isIn) {
            cardEl.classList.add("in");
          } else {
            cardEl.classList.remove("in");
          }
        }

        if (q > 0.6) {
          highestActiveIndex = i;
        }
      }

      setActiveCardIndex(highestActiveIndex);
      rafId = null;
    };

    const onScroll = () => {
      if (rafId == null) {
        rafId = requestAnimationFrame(updateStacking);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Initial check
    updateStacking();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cardCount, prefersReducedMotion]);

  return { containerRef, activeCardIndex };
}
