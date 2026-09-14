import { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-border/70 bg-surface p-6 shadow-xs transition-colors duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
