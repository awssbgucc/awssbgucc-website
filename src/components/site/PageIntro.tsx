export function PageIntro({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="mb-12">
      <h1 className="type-section">{title}</h1>
      <p className="mt-4 max-w-[62ch] text-text-muted">{intro}</p>
    </header>
  );
}
