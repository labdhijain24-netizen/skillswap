import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 * 
 * Attaches an IntersectionObserver to all elements with
 * the class "reveal" inside the given container ref.
 * Adds "visible" when they enter the viewport.
 */
export default function useScrollReveal(containerRef, deps = []) {
  useEffect(() => {
    const container = containerRef?.current || document;
    const targets = container.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
