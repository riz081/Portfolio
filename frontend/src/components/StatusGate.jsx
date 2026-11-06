import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { LuTriangleAlert } from 'react-icons/lu';
import { usePortfolio } from '../context/PortfolioContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { c } from '../utils/Themes';
import { LogoMark } from './Navbar';
import { Button } from './ui';

// The API can answer in milliseconds, so the splash holds long enough to register.
const MIN_SPLASH_MS = 900;
const EXIT_MS = 350;

const contentIn = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const barSlide = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(260%); }
`;

const Splash = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${c('ink')};
  color: ${c('text')};
  opacity: ${({ $leaving }) => ($leaving ? 0 : 1)};
  transition: opacity ${EXIT_MS}ms ease;
  pointer-events: ${({ $leaving }) => ($leaving ? 'none' : 'auto')};
`;

const SplashContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  animation: ${contentIn} 500ms ${c('easeEnter')} both;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: ${c('fontDisplay')};
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 700;
  letter-spacing: -0.015em;

  svg {
    width: 44px;
    height: 44px;
  }
`;

const Track = styled.div`
  position: relative;
  width: 130px;
  height: 3px;
  overflow: hidden;
  border-radius: 3px;
  background: ${c('line')};
`;

const Fill = styled.div`
  width: 38%;
  height: 100%;
  border-radius: 3px;
  background: ${c('accent')};
  animation: ${barSlide} 1100ms ease-in-out infinite;
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
  // splash: content not mounted yet. leaving: content mounts and its entrance
  // plays under the fading splash. done: splash removed.
  const [phase, setPhase] = useState('splash');

  useEffect(() => {
    if (status !== 'success') return undefined;
    if (reducedMotion) {
      setPhase('done');
      return undefined;
    }
    const remaining = Math.max(MIN_SPLASH_MS - (Date.now() - startedAt.current), 0);
    const leave = setTimeout(() => setPhase('leaving'), remaining);
    const finish = setTimeout(() => setPhase('done'), remaining + EXIT_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(finish);
    };
  }, [status, reducedMotion]);

  if (status === 'error') return <ErrorView retry={reload} />;

  return (
    <>
      {phase !== 'splash' && children}
      {phase !== 'done' && (
        <Splash $leaving={phase === 'leaving'} role="status" aria-label="Loading portfolio">
          <SplashContent>
            <Brand>
              <LogoMark />
              Rizqika Ibnu K
            </Brand>
            <Track><Fill /></Track>
          </SplashContent>
        </Splash>
      )}
    </>
  );
}
