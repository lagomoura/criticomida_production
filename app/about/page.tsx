import type { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';

export const metadata: Metadata = {
  title: 'Sobre CritiComida',
  description: 'Reseñamos platos, no restaurantes. La diferencia importa.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-surface-page">
      <article className="cc-container relative max-w-3xl py-12 md:py-20">
        {/* Decorative saffron blob */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-12 h-72 w-72 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, var(--color-azafran-light), transparent 70%)',
          }}
        />

        <header className="relative">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-action-primary">
            Manifiesto
          </p>
          <h1 className="mt-4 m-0 font-display text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[0.98] text-text-primary">
            Reseñamos <em className="not-italic text-action-primary">platos</em>,
            <br />
            no restaurantes.
          </h1>
          <p className="mt-6 max-w-xl font-display italic text-xl leading-relaxed text-text-secondary md:text-2xl">
            La pregunta nunca fue <span className="text-text-primary">«¿es un buen lugar?»</span> sino{' '}
            <span className="text-text-primary">«¿qué pido?»</span>.
          </p>
        </header>

        <section className="relative mt-14 grid gap-10 md:grid-cols-[auto_1fr] md:gap-x-12">
          <Pillar n="01" />
          <Stanza
            heading="El plato manda"
            body="Un restaurante puede ser un compendio de aciertos y errores. Una milanesa, no. Una milanesa es buena o no es. CritiComida indexa por plato — porque a la hora de pedir, eso es lo único que importa."
          />

          <Pillar n="02" />
          <Stanza
            heading="Reseñas con cuerpo"
            body="Textura, punto, porción, precio. La voz de alguien que ya pidió. Sin paréntesis emocionales, sin emojis decorativos: lo que comiste, cómo estaba, si volverías."
          />

          <Pillar n="03" />
          <Stanza
            heading="Comunidad de paladar"
            body="Seguís a gente cuyo paladar coincide con el tuyo. Guardás lo que querés probar. Tu lista de pendientes es un mapa de la ciudad escrito por gente que come."
          />
        </section>

        <section className="relative mt-16 rounded-3xl border-l-[3px] border-y border-r border-l-action-primary border-y-border-default border-r-border-default bg-surface-card p-6 sm:p-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-action-primary">
            La regla
          </p>
          <blockquote className="mt-3 m-0 font-display italic text-xl leading-relaxed text-text-primary sm:text-2xl">
            «Cada plato, su reseña.»
          </blockquote>
          <p className="mt-4 font-sans text-sm text-text-muted">
            Sin algoritmos opacos, sin estrellas inventadas, sin reseñas patrocinadas.
            Lo que probaste, dicho como si se lo contaras a un amigo.
          </p>
        </section>

        <footer className="relative mt-16 flex flex-col gap-4 border-t border-border-subtle pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 font-display italic text-lg text-text-secondary">
            ¿Te animás a sumar tu paladar?
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/registro" className="no-underline">
              <Button variant="primary" size="md">
                Crear cuenta
              </Button>
            </Link>
            <Link href="/" className="no-underline">
              <Button variant="ghost" size="md">
                Ver el feed
              </Button>
            </Link>
          </div>
        </footer>

        <p className="relative mt-10 font-sans text-xs text-text-muted">
          Hecho en Argentina · © {new Date().getFullYear()} CritiComida
        </p>
      </article>
    </main>
  );
}

function Pillar({ n }: { n: string }) {
  return (
    <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1 md:pt-2">
      <span className="font-display text-3xl font-medium leading-none text-action-primary tabular-nums">
        {n}
      </span>
      <span aria-hidden className="hidden h-px w-10 bg-border-default md:block" />
    </div>
  );
}

function Stanza({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h2 className="m-0 font-display text-2xl font-medium text-text-primary sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-3 max-w-prose font-sans text-base leading-relaxed text-text-secondary">
        {body}
      </p>
    </div>
  );
}
