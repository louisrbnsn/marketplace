'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type FadeInOnScrollProps = {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
};

export default function FadeInOnScroll({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: FadeInOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const getDirectionClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translate-y-8';
        case 'down':
          return '-translate-y-8';
        case 'left':
          return 'translate-x-8';
        case 'right':
          return '-translate-x-8';
        default:
          return '';
      }
    }
    return 'translate-y-0 translate-x-0';
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out ${getDirectionClass()} ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
