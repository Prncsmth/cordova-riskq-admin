import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "outline";
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const styles = {
    primary: "bg-primary text-white shadow-xs hover:bg-primary-dark active:brightness-95",
    secondary: "bg-warning text-white shadow-xs hover:brightness-95 active:brightness-90",
    danger: "bg-danger text-white shadow-xs hover:brightness-95 active:brightness-90",
    outline: "border border-border bg-surface text-foreground shadow-xs hover:bg-primary-light/40",
  };

  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${styles[variant]} ${className}`}
    />
  );
}