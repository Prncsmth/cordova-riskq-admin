type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white/60 p-10 text-center">
      <h3 className="font-semibold text-foreground">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-muted">{description}</p>
      )}
    </div>
  );
}