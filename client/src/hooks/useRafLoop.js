import { useEffect, useRef } from "react";

/**
 * Performant requestAnimationFrame loop that automatically pauses when:
 * 1. Element is off-screen (via active flag or IntersectionObserver)
 * 2. Document/tab is hidden (visibilitychange)
 * 3. Component unmounts
 *
 * @param {Function} callback - (deltaTime, timestamp) => void
 * @param {boolean} isRunning - whether the loop should actively run
 */
export function useRafLoop(callback, isRunning = true) {
  const savedCallback = useRef(callback);
  const frameRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let active = isRunning;

    const onVisibilityChange = () => {
      if (document.hidden) {
        active = false;
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      } else {
        active = isRunning;
        lastTimeRef.current = null;
        if (active) {
          frameRef.current = requestAnimationFrame(loop);
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    function loop(now) {
      if (!active) return;

      if (lastTimeRef.current == null) {
        lastTimeRef.current = now;
      }
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (savedCallback.current) {
        savedCallback.current(delta, now);
      }

      frameRef.current = requestAnimationFrame(loop);
    }

    if (active && !document.hidden) {
      lastTimeRef.current = null;
      frameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning]);
}
