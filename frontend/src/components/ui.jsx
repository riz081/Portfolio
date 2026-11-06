import styled, { css } from 'styled-components';
import { c } from '../utils/Themes';

const SectionRoot = styled.section`
  border-top: 1px solid ${c('line')};
`;

const SectionInner = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 56px;
  max-width: 1320px;
  margin: 0 auto;
  padding: 88px 32px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
    padding: 56px 20px;
  }
`;

const SectionHeader = styled.header`
  align-self: start;
  position: sticky;
  top: calc(${c('navHeight')} + 32px);

  @media (max-width: 900px) {
    position: static;
  }
`;

const SectionTitle = styled.h2`
  font-family: ${c('fontDisplay')};
  font-size: clamp(30px, 3.4vw, 40px);
  font-weight: 650;
  line-height: 1.1;
  letter-spacing: -0.015em;
`;

const SectionLede = styled.p`
  margin-top: 12px;
  max-width: 34ch;
  color: ${c('muted')};
`;

export const Section = ({ id, title, lede, children }) => (
  <SectionRoot id={id} aria-labelledby={`${id}-title`}>
    <SectionInner>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>{title}</SectionTitle>
        {lede && <SectionLede>{lede}</SectionLede>}
      </SectionHeader>
      <div>{children}</div>
    </SectionInner>
  </SectionRoot>
);

// Use as a link by default; pass as="button" for form actions.
export const Button = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px 22px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease, transform 120ms ease;

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ $variant }) => ($variant === 'secondary'
    ? css`
        background: transparent;
        border-color: ${c('line')};
        color: ${c('text')};
        &:hover {
          border-color: ${c('accent')};
          color: ${c('accent')};
        }
      `
    : css`
        background: ${c('primary')};
        color: ${c('onPrimary')};
        &:hover:not(:disabled) {
          background: ${c('primaryHover')};
        }
      `)}
`;

export const IconLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  color: ${c('muted')};
  font-size: 22px;
  transition: color 180ms ease, background-color 180ms ease;

  &:hover {
    color: ${c('accent')};
    background: ${c('surface')};
  }
`;
