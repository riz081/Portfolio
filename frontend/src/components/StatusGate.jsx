import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { LuTriangleAlert } from 'react-icons/lu';
import { usePortfolio } from '../context/PortfolioContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { c } from '../utils/Themes';
import { canRunScene, loadOrbitScene } from './HeroSection/sceneLoader';
import { Button } from './ui';

// The API can answer in milliseconds, so the intro holds long enough to register.
const MIN_INTRO_MS = 1100;
const WIPE_MS = 800;
const WIPE_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const SCROLL_KEY = 'portfolio-scroll-y';

// Sections that were merged keep their old links working.
const HASH_ALIASES = { '#about': '#top', '#certifications': '#credentials', '#education': '#credentials' };

// Content mounts after the intro, too late for the browser to restore scroll or
// follow a #hash, so both are handled here once the page exists.
const restoreScroll = () => {
  const navigationType = performance.getEntriesByType('navigation')[0]?.type;
  const saved = Number(sessionStorage.getItem(SCROLL_KEY));
  if ((navigationType === 'reload' || navigationType === 'back_forward') && saved > 0) {
    window.scrollTo({ top: saved, behavior: 'instant' });
    return;
  }
  const { hash } = window.location;
  if (hash) {
    document.querySelector(HASH_ALIASES[hash] || hash)?.scrollIntoView({ behavior: 'instant' });
  }
};

const plateTop = keyframes`
  from { opacity: 0; transform: translateY(-26px); }
  to { opacity: 1; transform: translateY(0); }
`;

const plateBottom = keyframes`
  from { opacity: 0; transform: translateY(26px); }
  to { opacity: 1; transform: translateY(0); }
`;

const plateMiddle = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const nameIn = keyframes`
  from { clip-path: inset(-20% 102% -20% -2%); }
  to { clip-path: inset(-20% -2% -20% -2%); }
`;

const sweep = keyframes`
  0%, 100% { transform: translateY(-6px); opacity: 0; }
  15%, 85% { opacity: 1; }
  50% { transform: translateY(78px); }
`;

const wipePanel = keyframes`
  from { clip-path: inset(0 0 0 0); }
  to { clip-path: inset(100% 0 0 0); }
`;

const wipeLine = keyframes`
  from { transform: translateY(0); opacity: 1; }
  95% { opacity: 1; }
  to { transform: translateY(100dvh); opacity: 0; }
`;

const Intro = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  pointer-events: ${({ $leaving }) => ($leaving ? 'none' : 'auto')};
`;

const Panel = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${c('ink')};
  color: ${c('text')};
  animation: ${({ $leaving }) => ($leaving ? wipePanel : 'none')} ${WIPE_MS}ms ${WIPE_EASE} both;
`;

const ScanLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: ${c('accent')};
  box-shadow: 0 0 22px 3px ${c('primary')};
  opacity: 0;
  animation: ${({ $leaving }) => ($leaving ? wipeLine : 'none')} ${WIPE_MS}ms ${WIPE_EASE} both;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Mark = styled.div`
  position: relative;
  width: 76px;
  height: 76px;

  svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  path {
    stroke-width: 1.6;
    stroke-linejoin: round;
  }
  .top {
    fill: ${c('primary')};
    stroke: ${c('primary')};
    animation: ${plateTop} 750ms ${c('easeEnter')} both;
  }
  .middle {
    fill: ${c('ink')};
    stroke: ${c('text')};
    animation: ${plateMiddle} 500ms ease both;
  }
  .bottom {
    fill: none;
    stroke: ${c('muted')};
    animation: ${plateBottom} 750ms ${c('easeEnter')} both;
  }
`;

// Keeps sweeping over the mark if the API takes longer than the intro.
const MarkScan = styled.div`
  position: absolute;
  left: -12px;
  right: -12px;
  top: 0;
  height: 2px;
  background: ${c('accent')};
  box-shadow: 0 0 12px 1px ${c('primary')};
  animation: ${sweep} 1500ms ease-in-out 450ms infinite both;
`;

const Name = styled.p`
  font-family: ${c('fontDisplay')};
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 650;
  letter-spacing: -0.01em;
  animation: ${nameIn} 700ms ${c('easeEnter')} 280ms both;
`;

const ErrorPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 16px;
  min-height: 100dvh;
  padding: 24px max(24px, calc((100vw - 560px) / 2));
  background-color: ${c('ink')};
  color: ${c('text')};

  svg {
    color: ${c('accent')};
  }
  h1 {
    font-family: ${c('fontDisplay')};
    font-size: 32px;
    line-height: 1.15;
  }
  p {
    color: ${c('muted')};
  }
`;

function ErrorView({ retry }) {
  return (
    <ErrorPage>
      <LuTriangleAlert size={36} aria-hidden="true" />
      <h1>This page couldn't load</h1>
      <p>The server can't be reached. Check your connection and try again.</p>
      <Button as="button" type="button" onClick={retry} style={{ border: 'none' }}>Try again</Button>
    </ErrorPage>
  );
}

export default function StatusGate({ children }) {
  const { status, reload } = usePortfolio();
  const reducedMotion = usePrefersReducedMotion();
  const startedAt = useRef(Date.now());
  // intro: content not mounted yet. leaving: content mounts and is uncovered
  // by the scan line wiping the panel away. done: intro removed.
  const [phase, setPhase] = useState('intro');

  // Parses the 3D code while only the static intro is on screen, so it can't
  // interrupt the hero's entrance.
  useEffect(() => {
    if (!reducedMotion && canRunScene()) loadOrbitScene().catch(() => {});
  }, [reducedMotion]);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    const saveScroll = () => sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
    window.addEventListener('pagehide', saveScroll);
    return () => window.removeEventListener('pagehide', saveScroll);
  }, []);

  const contentMounted = phase !== 'intro';
  useLayoutEffect(() => {
    if (contentMounted) restoreScroll();
  }, [contentMounted]);

  useEffect(() => {
    if (status !== 'success') return undefined;
    if (reducedMotion) {
      setPhase('done');
      return undefined;
    }
    const remaining = Math.max(MIN_INTRO_MS - (Date.now() - startedAt.current), 0);
    const leave = setTimeout(() => setPhase('leaving'), remaining);
    const finish = setTimeout(() => setPhase('done'), remaining + WIPE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(finish);
    };
  }, [status, reducedMotion]);

  if (status === 'error') return <ErrorView retry={reload} />;

  const leaving = phase === 'leaving';
  return (
    <>
      {phase !== 'intro' && children}
      {phase !== 'done' && (
        <Intro $leaving={leaving} role="status" aria-label="Loading portfolio">
          <Panel $leaving={leaving}>
            <Content>
              <Mark aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path className="bottom" d="M16 18.5 28 24 16 29.5 4 24Z" />
                  <path className="middle" d="M16 10.5 28 16 16 21.5 4 16Z" />
                  <path className="top" d="M16 2.5 28 8 16 13.5 4 8Z" />
                </svg>
                {!leaving && <MarkScan />}
              </Mark>
              <Name>Rizqika Ibnu K</Name>
            </Content>
          </Panel>
          <ScanLine $leaving={leaving} />
        </Intro>
      )}
    </>
  );
}
