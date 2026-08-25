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
      className={`rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}
