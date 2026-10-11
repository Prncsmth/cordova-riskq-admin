import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type SettingRowProps = {
  icon: LucideIcon;
  label: string;
  description?: string;
  children: ReactNode;
  danger?: boolean;
};

export default function SettingRow({ icon: Icon, label, description, children, danger = false }: SettingRowProps) {
  return (
    <div className="flex items-center gap-3.5 px-1 py-4">
      <Icon size={19} strokeWidth={2.25} className={`shrink-0 ${danger ? "text-danger" : "text-primary"}`} />

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${danger ? "text-danger" : "text-foreground"}`}>{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}
