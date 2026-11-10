import { Reveal, RevealWords } from './Reveal.jsx';
import './section.css';

/**
 * One section of the experience: consistent rhythm, one heading voice, and a
 * heading that reveals itself once on entry. `tone` switches between the night
 * palette and the cream "paper" interlude used for the long letter.
 */
export function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  titleClassName = '',
  align = 'center',
  tone = 'night',
  children,
  className = '',
  headerExtra,
  as = 'section',
  ...rest
}) {
  const Tag = as;
  const hasHeader = Boolean(eyebrow || title || subtitle);

  return (
    <Tag
      id={id}
      className={`section section--${tone} section--${align} ${className}`.trim()}
      data-section={id}
      tabIndex={-1}
      aria-labelledby={title ? `${id}-title` : undefined}
      {...rest}
    >
      <div className="section__inner">
        {hasHeader ? (
          <header className="section__header">
            {eyebrow ? (
              <Reveal as="p" className="u-eyebrow" y={12} blur={3}>
                {eyebrow}
              </Reveal>
            ) : null}

            {title ? (
              <h2 id={`${id}-title`} className={`section__title ${titleClassName}`.trim()}>
                <RevealWords text={title} />
              </h2>
            ) : null}

            {subtitle ? (
              <Reveal as="p" className="section__subtitle u-lead" y={16} blur={4} delay={0.12}>
                {subtitle}
              </Reveal>
            ) : null}

            {headerExtra}

            <Reveal as="div" className="section__rule" y={0} blur={0} delay={0.2}>
              <span className="section__rule-dot" aria-hidden="true" />
            </Reveal>
          </header>
        ) : null}

        <div className="section__body">{children}</div>
      </div>
    </Tag>
  );
}

export default SectionShell;
