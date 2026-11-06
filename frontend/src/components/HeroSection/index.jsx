import React from 'react'
import styled, { keyframes } from "styled-components";
import { SiGithub } from "react-icons/si"
import { FaLinkedinIn } from "react-icons/fa"
import { LuFileText } from "react-icons/lu"
import { usePortfolio } from "../../context/PortfolioContext"
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion"
import { c } from "../../utils/Themes"
import { Button, IconLink } from "../ui"
import fallbackPortrait from "../../images/portrait.jpg"
import { canRunScene, loadOrbitScene } from "./sceneLoader"

const PROOF = [
  '9+ production projects',
  '3 apps live on Google Play',
  '94.2/100 in mobile penetration testing',
];

// Content is uncovered as the page intro's line passes.
// The negative insets keep descenders, hover states, and focus rings from being clipped.
const scanDown = keyframes`
  from { clip-path: inset(-24px -24px 100% -24px); }
  to { clip-path: inset(-24px -24px -24px -24px); }
`;

const scanAcross = keyframes`
  from { clip-path: inset(-8% 102% -14% -2%); }
  to { clip-path: inset(-8% -2% -14% -2%); }
`;

const stageIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const HeroRoot = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100dvh - ${c('navHeight')});
  padding: 0 32px 40px;
  overflow: hidden;
  text-align: center;

  @media (max-width: 640px) {
    padding: 0 20px 32px;
  }
`;

// The object sits behind the copy and fades out before reaching the text,
// so the headline overlaps it without losing contrast.
const Stage = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: min(1180px, 100%);
  height: clamp(340px, 66dvh, 640px);
  transform: translateX(-50%);
  animation: ${stageIn} 700ms ease 150ms both;
  -webkit-mask-image: linear-gradient(to bottom, #000 52%, transparent 70%);
  mask-image: linear-gradient(to bottom, #000 52%, transparent 70%);

  canvas {
    position: absolute;
    inset: 0;
    display: block;
    opacity: ${({ $ready }) => ($ready ? 1 : 0)};
    transition: opacity 600ms ease;
  }

  @media (max-width: 640px) {
    height: 400px;
  }
`;

// Soft light behind the object. Stays in place with reduced motion too.
const Halo = styled.div`
  position: absolute;
  top: 44%;
  left: 50%;
  width: min(760px, 110%);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  background: radial-gradient(closest-side, rgba(133, 76, 230, 0.34), rgba(133, 76, 230, 0.1) 55%, transparent);
  pointer-events: none;
`;

const Poster = styled.svg`
  position: absolute;
  top: 44%;
  left: 50%;
  width: auto;
  height: 82%;
  transform: translate(-50%, -50%);
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: opacity 500ms ease;
`;

const Copy = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: clamp(250px, 41dvh, 400px);

  @media (max-width: 640px) {
    margin-top: 262px;
  }
`;

const Reveal = styled.div`
  animation: ${scanDown} 620ms ${c('easeEnter')} both;
  animation-delay: ${({ $delay }) => $delay}ms;
`;

const Credits = styled(Reveal)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 32px;
  margin-top: 22px;
`;

const Byline = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
`;

const Portrait = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid ${c('line')};
  object-fit: cover;
  filter: saturate(0.75) contrast(1.04);
`;

const Name = styled.p`
  font-weight: 650;
  line-height: 1.3;
`;

const Role = styled.p`
  color: ${c('muted')};
  font-size: 15px;
  line-height: 1.3;
`;

const Headline = styled.h1`
  font-family: ${c('fontDisplay')};
  font-size: clamp(38px, 5.2vw, 76px);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.025em;
`;

const Line = styled.span`
  display: block;
  text-wrap: balance;
  animation: ${scanAcross} 900ms ${c('easeEnter')} both;
  animation-delay: ${({ $delay }) => $delay}ms;
`;

const Lede = styled.p`
  margin-top: 18px;
  max-width: 68ch;
  color: ${c('muted')};
  font-size: 17px;
`;

const Actions = styled(Reveal)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

const ProofList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 28px;
  list-style: none;
  font-size: 15px;
`;

const POSTER_RINGS = [
  { rx: 230, ry: 96, rotate: -24, width: 30 },
  { rx: 186, ry: 118, rotate: 38, width: 24 },
  { rx: 146, ry: 66, rotate: 72, width: 20 },
  { rx: 106, ry: 88, rotate: -58, width: 16 },
];

const Hero = () => {
  const { data } = usePortfolio();
  const Bio = data?.bio || {};
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = React.useRef(null);
  const [sceneReady, setSceneReady] = React.useState(false);

  // The 3D scene is its own chunk. The SVG poster stays for reduced motion,
  // data saver, low-end devices, no WebGL, and while the chunk loads.
  React.useEffect(() => {
    if (reducedMotion || !canRunScene()) {
      setSceneReady(false);
      return undefined;
    }
    let dispose;
    let cancelled = false;
    const stage = stageRef.current;
    loadOrbitScene()
      .then(({ createOrbitScene }) => {
        if (cancelled) return;
        dispose = createOrbitScene({
          container: stage,
          onReady: () => setSceneReady(true),
          onTooSlow: () => {
            dispose?.();
            dispose = null;
            setSceneReady(false);
          },
        });
      })
      .catch((error) => console.error('[hero] 3D scene unavailable:', error));
    return () => {
      cancelled = true;
      dispose?.();
      setSceneReady(false);
    };
  }, [reducedMotion]);

  return (
    <HeroRoot id="top" aria-labelledby="top-title">
      <Stage ref={stageRef} $ready={sceneReady} aria-hidden="true">
        <Halo />
        <Poster viewBox="-260 -260 520 520" fill="none" $hidden={sceneReady}>
          <defs>
            <linearGradient id="poster-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#C4B1FF" />
              <stop offset="0.55" stopColor="#854CE6" />
              <stop offset="1" stopColor="#FF9FD0" />
            </linearGradient>
          </defs>
          {POSTER_RINGS.map(({ rx, ry, rotate, width }) => (
            <ellipse
              key={rx}
              rx={rx}
              ry={ry}
              transform={`rotate(${rotate})`}
              stroke="url(#poster-ring)"
              strokeWidth={width}
            />
          ))}
        </Poster>
      </Stage>
      <Copy>
        <Headline id="top-title">
          <Line $delay={120}>I build the whole stack,</Line>
          <Line $delay={260}>then try to break it.</Line>
        </Headline>
        <Reveal $delay={380}>
          <Lede>
            Backends in Spring Boot, Go, NestJS, and Laravel. Mobile apps in Flutter and React Native.
            Web platforms in React, Next.js, and Angular. Trained in Android penetration testing,
            with OWASP and secure coding in my daily work.
          </Lede>
        </Reveal>
        <Actions $delay={480}>
          <Button href="#projects">See my work</Button>
          {Bio.resume && (
            <Button $variant="secondary" href={Bio.resume} target="_blank" rel="noopener noreferrer">
              <LuFileText aria-hidden="true" /> Open resume
            </Button>
          )}
          {Bio.github && (
            <IconLink href={Bio.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <SiGithub aria-hidden="true" />
            </IconLink>
          )}
          {Bio.linkedin && (
            <IconLink href={Bio.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn aria-hidden="true" />
            </IconLink>
          )}
        </Actions>
        <Credits $delay={580}>
          <Byline>
            <Portrait
              src={Bio.avatar_url || fallbackPortrait}
              alt={`Portrait of ${Bio.name}`}
              width="52"
              height="52"
            />
            <div>
              <Name>{Bio.name}</Name>
              <Role>Full stack developer</Role>
            </div>
          </Byline>
          <ProofList>
            {PROOF.map((item) => <li key={item}>{item}</li>)}
          </ProofList>
        </Credits>
      </Copy>
    </HeroRoot>
  );
}

export default Hero
