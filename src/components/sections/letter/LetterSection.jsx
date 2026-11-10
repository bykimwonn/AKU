import { Quote } from 'lucide-react';
import siteConfig from '../../../config/site.config.js';
import { interpolate } from '../../../utils/text.js';
import { SectionShell } from '../../ui/SectionShell.jsx';
import { Reveal } from '../../ui/Reveal.jsx';
import { Signature } from '../../ui/Signature.jsx';
import './letter.css';

/**
 * SECTION 4 — the long letter.
 *
 * The one chapter set on paper instead of in the dark: a real reading layout,
 * generous line-height, a drop cap, and paragraphs that settle as they arrive.
 * Everything here comes from `letter` in src/config/site.config.js.
 */
export function LetterSection() {
  const letter = siteConfig.letter;
  const paragraphs = Array.isArray(letter.paragraphs) ? letter.paragraphs : [];

  return (
    <SectionShell
      id="letter"
      tone="paper"
      align="center"
      eyebrow={letter.eyebrow}
      title={letter.title}
      subtitle={letter.subtitle}
      className="letter-section"
    >
      <article className="sheet">
        <div className="sheet__edge" aria-hidden="true" />

        <header className="sheet__head">
          <span className="sheet__mark" aria-hidden="true">
            <Quote size={16} strokeWidth={1.4} />
          </span>
          {letter.greeting ? (
            <p className="sheet__greeting u-hand">{interpolate(letter.greeting)}</p>
          ) : null}
        </header>

        <div className="sheet__body">
          {paragraphs.map((paragraph, index) => (
            <Reveal
              key={`letter-${index}`}
              as="p"
              className={index === 0 ? 'sheet__text sheet__text--first' : 'sheet__text'}
              y={22}
              blur={5}
              once
            >
              {interpolate(paragraph)}
            </Reveal>
          ))}
        </div>

        <footer className="sheet__foot">
          <span className="sheet__rule" aria-hidden="true" />
          {letter.closing ? (
            <Reveal as="p" className="sheet__closing" y={14} blur={4}>
              {interpolate(letter.closing)}
            </Reveal>
          ) : null}
          <Reveal as="div" className="sheet__sign" y={14} blur={4} delay={0.1}>
            <Signature tone="paper" />
          </Reveal>
        </footer>
      </article>
    </SectionShell>
  );
}

export default LetterSection;
