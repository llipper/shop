"use client";

import { Header } from "@/components/layout/header";

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          ROCCIUS
        </p>
        <h1 className="mb-4 text-3xl font-medium md:text-4xl">{title}</h1>
        <p className="mb-10 text-muted-foreground leading-relaxed">{intro}</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-lg font-medium text-foreground">{section.title}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}