import Link from 'next/link';

interface RouteStubProps {
  title: string;
  description: string;
  badge?: string;
}

export default function RouteStub({ title, description, badge = 'En construcción' }: RouteStubProps) {
  return (
    <main
      id="main-content"
      className="cc-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"
    >
      <span className="mb-4 inline-block rounded-full bg-action-highlight/20 px-3 py-1 font-sans text-xs uppercase tracking-[0.08em] text-action-primary">
        {badge}
      </span>
      <h1 className="mb-4 font-display text-4xl font-medium leading-tight text-text-primary sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-lg font-sans text-base leading-relaxed text-text-muted sm:text-lg">
        {description}
      </p>
      <Link
        href="/"
        className="mt-8 font-sans text-sm text-action-primary underline-offset-4 hover:underline"
      >
        ← Volver al inicio
      </Link>
    </main>
  );
}
