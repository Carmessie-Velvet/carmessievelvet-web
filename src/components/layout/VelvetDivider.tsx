export function VelvetDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center bg-velvet py-4">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-cream-soft sm:text-sm">
        {label}
      </p>
    </div>
  );
}
