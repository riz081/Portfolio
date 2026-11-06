import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

// Tracks whether an element is in view, and which side it left from, so it can
// hide when scrolled away and show again when scrolled back, in either direction.
// Returns 'shown', 'above', or 'below'.
export default function useReveal() {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [position, setPosition] = useState('below');

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion || typeof IntersectionObserver === 'undefined') {
      setPosition('shown');
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPosition('shown');
        else setPosition(entry.boundingClientRect.top < 0 ? 'above' : 'below');
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return [ref, position];
}
