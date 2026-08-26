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
    primary:
      "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm hover:brightness-110 active:brightness-95",
    secondary: "bg-linear-to-b from-warning to-warning/90 text-white shadow-sm hover:brightness-110",
    danger: "bg-linear-to-b from-danger to-danger/90 text-white shadow-sm hover:brightness-110",
    outline: "border border-border bg-white text-foreground shadow-xs hover:bg-primary-light/40",
  };

  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${styles[variant]} ${className}`}
    />
  );
}