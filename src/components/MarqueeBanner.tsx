export function MarqueeBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-primary text-primary-foreground py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="font-display text-lg tracking-widest mx-8">
              IDENTIDADE SANTIDADE • 2026 •
            </span>
          ))}
        </div>
      </div>
      <div className="h-px bg-background w-full" />
    </div>
  );
}
