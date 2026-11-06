import React from 'react'
import styled, { keyframes } from "styled-components";
import { SiGithub } from "react-icons/si"
import { FaLinkedinIn } from "react-icons/fa"
import { LuFileText } from "react-icons/lu"
import { usePortfolio } from "../../context/PortfolioContext"
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion"
import { c } from "../../utils/Themes"
import { Button, IconLink } from "../ui"
import StackDiagram from "../StackDiagram"
import fallbackPortrait from "../../images/portrait.jpg"

const LABELS = [
  { name: 'client', title: 'Client', detail: 'Flutter, React Native, Next.js' },
  { name: 'api', title: 'API', detail: 'REST, Gin, Laravel' },
  { name: 'services', title: 'Services', detail: 'Go, NestJS, Laravel' },
  { name: 'data', title: 'Data', detail: 'PostgreSQL, MySQL' },
];

const PROOF = [
  '9+ production projects',
  '3 apps live on Google Play',
  '94.2/100 in mobile penetration testing',
];

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(45px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUpScale = keyframes`
  from { opacity: 0; transform: translateY(60px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const HeroRoot = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  max-width: 1320px;
  min-height: calc(100dvh - ${c('navHeight')});
  margin: 0 auto;
  padding: 48px 32px 56px;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
    padding: 32px 20px 40px;
  }
`;

const Copy = styled.div`
  position: relative;
  z-index: 1;
`;

const Reveal = styled.div`
  animation: ${slideUp} 850ms ${c('easeEnter')} both;
  animation-delay: ${({ $delay }) => $delay}ms;
`;

const Byline = styled(Reveal)`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
`;

const Portrait = styled.img`
  width: 64px;
  height: 64px;
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
  font-size: clamp(40px, 4.7vw, 68px);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.025em;
`;

const Line = styled.span`
  display: block;
  text-wrap: balance;
  animation: ${slideUp} 850ms ${c('easeEnter')} both;
  animation-delay: ${({ $delay }) => $delay}ms;
`;

const Lede = styled.p`
  margin-top: 24px;
  max-width: 54ch;
  color: ${c('muted')};
  font-size: 18px;
`;

const Actions = styled(Reveal)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
`;

const ProofList = styled(Reveal)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid ${c('line')};
  list-style: none;
  font-size: 15px;
`;

const Stage = styled.div`
  position: relative;
  width: 100%;
  animation: ${slideUpScale} 1000ms ${c('easeEnter')} 560ms both;
  height: min(72vh, 640px);
  min-height: 460px;

  canvas {
    position: absolute;
    inset: 0;
    display: block;
    opacity: ${({ $ready }) => ($ready ? 1 : 0)};
    transition: opacity 500ms ease;
  }

  @media (max-width: 960px) {
    height: clamp(280px, 56vw, 380px);
    min-height: 0;
  }
`;

const Poster = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: opacity 400ms ease;
  pointer-events: none;

  svg {
    max-width: 560px;
  }
`;

const Label = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding-left: 26px;
  max-width: 170px;
  opacity: ${({ $ready }) => ($ready ? 1 : 0)};
  transition: opacity 500ms ease 900ms;
  pointer-events: none;
  will-change: transform;

  &::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 50%;
    width: 18px;
    border-top: 1px solid currentColor;
  }

  color: ${c('muted')};
  &[data-lit='true'] {
    color: ${c('accent')};
  }

  strong {
    display: block;
    font-size: 15px;
    font-weight: 650;
    line-height: 1.25;
    color: inherit;
    transition: color 200ms ease;
  }

  span {
    display: block;
    font-size: 13px;
    line-height: 1.3;
  }

  @media (max-width: 960px) {
    span {
      display: none;
    }
  }
`;

const ScanLabel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  margin-left: -150px;
  width: 150px;
  padding-right: 8px;
  text-align: right;
  font-size: 13px;
  font-weight: 650;
  color: ${c('accent')};
  opacity: 0;
  pointer-events: none;
  will-change: transform;

  @media (max-width: 960px) {
    display: none;
  }
`;

const canUseWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const Hero = () => {
  const { data } = usePortfolio();
  const Bio = data?.bio || {};
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = React.useRef(null);
  const [sceneReady, setSceneReady] = React.useState(false);

  // The 3D scene is its own chunk. The SVG poster stays for reduced motion,
  // data saver, no WebGL, and while the chunk loads.
  React.useEffect(() => {
    const saveData = navigator.connection?.saveData;
    if (reducedMotion || saveData || !canUseWebGL()) {
      setSceneReady(false);
      return undefined;
    }
    let dispose;
    let cancelled = false;
    const stage = stageRef.current;
    import('./stackScene')
      .then(({ createStackScene }) => {
        if (cancelled) return;
        dispose = createStackScene({
          container: stage,
          labelFor: (name) => stage.querySelector(`[data-layer="${name}"]`),
          onReady: () => setSceneReady(true),
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
      <Copy>
        <Byline $delay={100}>
          <Portrait
            src={Bio.avatar_url || fallbackPortrait}
            alt={`Portrait of ${Bio.name}`}
            width="64"
            height="64"
          />
          <div>
            <Name>{Bio.name}</Name>
            <Role>Full stack developer</Role>
          </div>
        </Byline>
        <Headline id="top-title">
          <Line $delay={220}>I build the whole stack,</Line>
          <Line $delay={300}>then try to break it.</Line>
        </Headline>
        <Reveal $delay={380}>
          <Lede>
            Backends in Go, NestJS, and Laravel. Mobile apps in Flutter and React Native.
            Web platforms in React and Next.js. Trained in Android penetration testing,
            with OWASP and secure coding in my daily work.
          </Lede>
        </Reveal>
        <Actions $delay={460}>
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
        <ProofList as="ul" $delay={540}>
          {PROOF.map((item) => <li key={item}>{item}</li>)}
        </ProofList>
      </Copy>
      <Stage ref={stageRef} $ready={sceneReady} aria-hidden="true">
        <Poster $hidden={sceneReady}>
          <StackDiagram device="mobile" title="hero" />
        </Poster>
        {LABELS.map(({ name, title, detail }) => (
          <Label key={name} data-layer={name} $ready={sceneReady}>
            <strong>{title}</strong>
            <span>{detail}</span>
          </Label>
        ))}
        <ScanLabel data-layer="scan">OWASP checks</ScanLabel>
      </Stage>
    </HeroRoot>
  );
}

export default Hero
