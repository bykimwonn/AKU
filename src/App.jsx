import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import siteConfig from './config/site.config.js';
import { SECTIONS, SECTION_IDS } from './config/sections.js';
import { useActiveSection } from './hooks/useActiveSection.js';
import { useMusicEngine } from './hooks/useMusicEngine.js';
import { useScrollLock } from './hooks/useScrollLock.js';
import { interpolate } from './utils/text.js';

import { Starfield } from './components/effects/Starfield.jsx';
import { Petals } from './components/effects/Petals.jsx';
import { NavRail } from './components/ui/NavRail.jsx';
import { TopBar } from './components/ui/TopBar.jsx';
import { ScrollProgress } from './components/ui/ScrollProgress.jsx';

import { Welcome } from './components/sections/welcome/Welcome.jsx';
import { EnvelopeSection } from './components/sections/envelope/EnvelopeSection.jsx';
import { GallerySection } from './components/sections/gallery/GallerySection.jsx';
import { LetterSection } from './components/sections/letter/LetterSection.jsx';
import { GiftsSection } from './components/sections/gifts/GiftsSection.jsx';
import { CakeSection } from './components/sections/cake/CakeSection.jsx';
import { GoodbyeSection } from './components/sections/goodbye/GoodbyeSection.jsx';

import './styles/app.css';

/**
 * The shell. It owns four things and nothing else:
 *   1. whether the prologue is still up (`entered`)
 *   2. the music, which must survive every section and overlay
 *   3. where the visitor currently is, for the navigation
 *   4. the fixed night sky behind everything
 */
export default function App() {
  const [entered, setEntered] = useState(false);
  const { active, goTo } = useActiveSection(SECTION_IDS);
  const music = useMusicEngine(siteConfig);
  const effects = siteConfig.effects || {};

  /* the tab title follows the config, so renaming her is a one-line change */
  useEffect(() => {
    document.title = interpolate(siteConfig.brand.title);
  }, []);

  /* while the prologue is up, the page behind it must not scroll */
  useScrollLock(!entered);

  const enter = useCallback(() => {
    setEntered(true);
    music.maybeAutoStart();
    // Let the exit animation begin before the page moves.
    window.setTimeout(() => goTo(SECTIONS[0].id), 60);
  }, [goTo, music]);

  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setEntered(false);
  }, []);

  /* keyboard: Alt+↑/↓ walks the chapters, M toggles the music */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const dialogOpen = Boolean(document.querySelector('[role="dialog"]'));

      if (event.key.toLowerCase() === 'm' && !event.altKey && !event.metaKey && !event.ctrlKey) {
        if (dialogOpen) return;
        event.preventDefault();
        music.toggle();
        return;
      }

      if (event.altKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        if (!entered) {
          if (event.key === 'ArrowDown') enter();
          return;
        }
        const current = SECTION_IDS.indexOf(active);
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        const id = SECTIONS[Math.max(0, Math.min(SECTIONS.length - 1, next))]?.id;
        if (id) goTo(id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, entered, enter, goTo, music]);

  return (
    <div className="app">
      <div className="stage" aria-hidden="true">
        <div className={`stage__sky ${entered ? 'is-live' : ''}`.trim()} />
        {effects.starfield !== false ? (
          <Starfield className={`stage__stars ${entered ? 'is-dim' : ''}`.trim()} />
        ) : null}
        {effects.petals !== false ? <Petals /> : null}
      </div>

      {/* Only offered once the experience itself is reachable. */}
      {entered ? (
        <a className="skip-link" href="#envelope">
          Skip to the surprise
        </a>
      ) : null}

      {entered ? <ScrollProgress /> : null}

      <TopBar
        visible={entered}
        wordmark={interpolate(siteConfig.brand.wordmark)}
        active={active}
        onJump={goTo}
        music={music}
      />

      <NavRail active={active} onJump={goTo} visible={entered} />

      <main className="experience" id="experience" inert={!entered ? true : undefined}>
        <EnvelopeSection onJump={goTo} />
        <GallerySection />
        <LetterSection />
        <GiftsSection />
        <CakeSection />
        <GoodbyeSection onReplay={replay} />
      </main>

      <AnimatePresence>
        {entered ? null : <Welcome key="welcome" onOpen={enter} />}
      </AnimatePresence>
    </div>
  );
}
