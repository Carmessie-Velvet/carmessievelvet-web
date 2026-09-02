export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">{title}</h1>
      <div className="mt-8 flex flex-col gap-5 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
    </div>
  );
}
