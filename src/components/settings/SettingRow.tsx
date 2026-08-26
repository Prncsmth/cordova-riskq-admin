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
    <div className="flex items-center gap-4 px-1 py-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ${
          danger ? "bg-danger-light text-danger ring-danger/15" : "bg-primary-light text-primary ring-primary/10"
        }`}
      >
        <Icon size={17} strokeWidth={2.25} />
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${danger ? "text-danger" : "text-foreground"}`}>{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}
