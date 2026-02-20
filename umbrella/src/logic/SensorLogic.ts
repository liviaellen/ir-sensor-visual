import { useState, useEffect, useRef } from 'react';

export const usePresenceTimer = (isPresent: boolean) => {
  const [duration, setDuration] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPresent) {
      startTimeRef.current = Date.now() - duration * 1000; // Resume from current duration

      const animate = () => {
        if (startTimeRef.current !== null) {
          const now = Date.now();
          setDuration((now - startTimeRef.current) / 1000); // Duration in seconds
          requestRef.current = requestAnimationFrame(animate);
        }
      };

      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      startTimeRef.current = null;
      // Optional: Reset duration immediately when leaving?
      // Or maybe decay it slowly? For now, let's reset to 0 to match "Sensors" logic.
      setDuration(0);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPresent]);

  return duration;
};
