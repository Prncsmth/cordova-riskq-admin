export type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** Gradient-filled, high-emphasis pill for the most urgent/active state in a list (e.g. "Active", "New"). Soft tint otherwise. */
  solid?: boolean;
};

export default function Badge({
  children,
  variant = "default",
  solid = false,
}: BadgeProps) {
  const styles = {
    success: "bg-success-light text-success ring-1 ring-success/15",
    warning: "bg-warning-light text-warning ring-1 ring-warning/15",
    danger: "bg-danger-light text-danger ring-1 ring-danger/15",
    info: "bg-info-light text-info ring-1 ring-info/15",
    default: "bg-background text-muted ring-1 ring-border",
  };

  const solidStyles = {
    success: "bg-linear-to-br from-success to-success/80 text-white shadow-[0_2px_8px_-1px_rgba(21,128,61,0.45)]",
    warning: "bg-linear-to-br from-warning to-warning/80 text-white shadow-[0_2px_8px_-1px_rgba(180,83,9,0.45)]",
    danger: "bg-linear-to-br from-danger to-danger/80 text-white shadow-[0_2px_8px_-1px_rgba(220,38,38,0.45)]",
    info: "bg-linear-to-br from-info to-info/80 text-white shadow-[0_2px_8px_-1px_rgba(29,78,216,0.45)]",
    default: "bg-linear-to-br from-muted to-muted/80 text-white shadow-sm",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${solid ? solidStyles[variant] : styles[variant]}`}
    >
      {children}
    </span>
  );
}
