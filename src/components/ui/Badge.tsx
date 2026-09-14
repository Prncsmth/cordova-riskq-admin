export type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** Flat, high-emphasis pill for the most urgent/active state in a list (e.g. "Active", "New"). Soft tint otherwise. */
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
    success: "bg-success text-white shadow-xs",
    warning: "bg-warning text-white shadow-xs",
    danger: "bg-danger text-white shadow-xs",
    info: "bg-info text-white shadow-xs",
    default: "bg-muted text-white shadow-xs",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${solid ? solidStyles[variant] : styles[variant]}`}
    >
      {children}
    </span>
  );
}
