export type LegalSection = {
  heading: string;
  paragraphs: string[];
  /** Rendered as a list after the section paragraphs. */
  bullets?: string[];
  /** Paragraphs rendered after the bullet list. */
  closingParagraphs?: string[];
};

export type LegalDocumentCopy = {
  title: string;
  lastUpdated: string;
  intro: string;
  /** Additional lead-in paragraphs rendered after the intro. */
  introParagraphs?: string[];
  sections: LegalSection[];
};

/** Compact layout for side sheets; the page reads on the dark storefront background. */
type LegalDocumentVariant = "page" | "sheet";

type LegalDocumentStyles = {
  container: string;
  surface: string;
  title: string;
  meta: string;
  body: string;
  heading: string;
};

/** Page: glass surface on the dark background. Sheet: dark text on the white panel. */
const DOCUMENT_STYLES: Record<LegalDocumentVariant, LegalDocumentStyles> = {
  page: {
    container:
      "mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10",
    surface:
      "liquid-glass isolate flex flex-col gap-8 overflow-hidden rounded-3xl px-5 py-6 sm:px-6 sm:py-7",
    title:
      "font-big-fat-boii text-2xl font-normal tracking-wide text-white uppercase",
    meta: "relative z-[2] text-sm text-white/70",
    body: "relative z-[2] text-base leading-relaxed text-white/85",
    heading:
      "relative z-[2] font-big-fat-boii text-lg font-normal tracking-wide text-white uppercase",
  },
  sheet: {
    container: "flex flex-col gap-6",
    surface: "flex flex-col gap-6",
    title: "text-xl font-semibold text-[var(--foreground)]",
    meta: "text-sm text-[var(--muted)]",
    body: "text-base leading-relaxed text-[var(--foreground)]",
    heading: "text-lg font-semibold text-[var(--foreground)]",
  },
};

function LegalSectionBlock({
  section,
  styles,
}: {
  section: LegalSection;
  styles: LegalDocumentStyles;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={styles.heading}>{section.heading}</h2>
      {section.paragraphs.map((paragraph, index) => (
        <p key={`${section.heading}-${index}`} className={styles.body}>
          {paragraph}
        </p>
      ))}
      {section.bullets ? (
        <ul className={`flex list-disc flex-col gap-2 pl-5 ${styles.body}`}>
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {section.closingParagraphs?.map((paragraph, index) => (
        <p key={`${section.heading}-closing-${index}`} className={styles.body}>
          {paragraph}
        </p>
      ))}
    </section>
  );
}

type LegalDocumentViewProps = {
  copy: LegalDocumentCopy;
  lastUpdatedLabel: string;
  variant?: LegalDocumentVariant;
};

export function LegalDocumentView({
  copy,
  lastUpdatedLabel,
  variant = "page",
}: LegalDocumentViewProps) {
  const styles = DOCUMENT_STYLES[variant];

  return (
    <article className={styles.container}>
      {variant === "sheet" ? null : (
        <h1 className={styles.title}>{copy.title}</h1>
      )}

      <div className={styles.surface}>
        <header className="flex flex-col gap-3">
          <p className={styles.meta}>
            {lastUpdatedLabel} {copy.lastUpdated}
          </p>
          <p className={styles.body}>{copy.intro}</p>
          {copy.introParagraphs?.map((paragraph, index) => (
            <p key={`intro-${index}`} className={styles.body}>
              {paragraph}
            </p>
          ))}
        </header>

        <div className="flex flex-col gap-8">
          {copy.sections.map((section) => (
            <LegalSectionBlock
              key={section.heading}
              section={section}
              styles={styles}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
