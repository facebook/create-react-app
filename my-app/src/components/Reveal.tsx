import type { ElementType, ReactNode } from 'react';
import { useReveal } from '../lib/useReveal';

interface RevealProps {
  children: ReactNode;
  /** Stagger within a group, in milliseconds. */
  delay?: number;
  className?: string;
  as?: ElementType;
}

/** Fades and lifts its children into view the first time they are scrolled to. */
export function Reveal({ children, delay = 0, className, as }: RevealProps) {
  const ref = useReveal<HTMLElement>();
  const Tag = (as ?? 'div') as ElementType;

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
